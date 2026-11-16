import { test } from 'node:test';
import { readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';
import { botWebhook } from '../src/telegram-bot.mjs';
import { receiveTelegramUpdate } from '../src/telegram-receipts.mjs';
import { words } from '../dist/words.mjs';
import { newCourse } from '../dist/engine.mjs';

test('D1 review-commit trigger marks one session atomically and rejects a replay',async()=>{
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  try {
    await migrate(mf);
    const db=await mf.getD1Database('DB');
    const now=Date.now(),learnerId='review-unit-1',telegramId='314159';
    await db.prepare('INSERT INTO learners (id,created_at,updated_at) VALUES (?,?,?)')
      .bind(learnerId,now,now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind(telegramId,learnerId,'Review unit test',now,now).run();
    const round=JSON.stringify({entries:['word-people-1'],stages:[{kind:'choice'}]});
    const create = async id => db.prepare('INSERT INTO bot_review_sessions '+
      '(id,telegram_id,learner_id,pair,round_json,cursor,created_at,expires_at) VALUES (?,?,?,?,?,1,?,?)')
      .bind(id,telegramId,learnerId,'uz>ar',round,now,now+100000).run();
    await create('first-session');
    await assert.rejects(create('overlapping-session'),/UNIQUE constraint failed/,
      'the partial index prevents two active graded rounds for one Telegram user');
    const save = async(id,revision)=>db.prepare(
      'UPDATE learners SET revision=revision+1, updated_at=?,last_bot_review_session_id=? '+
      'WHERE id=? AND revision=? AND EXISTS ('+
      'SELECT 1 FROM bot_review_sessions WHERE id=? AND learner_id=learners.id '+
      'AND committed_at IS NULL AND expires_at>? AND cursor=json_array_length(json_extract(round_json,\'$.stages\'))'+
      ') RETURNING revision'
    ).bind(now,id,learnerId,revision,id,now).first();
    assert.equal((await save('first-session',0)).revision,1);
    assert.equal((await db.prepare('SELECT committed_at FROM bot_review_sessions WHERE id=?')
      .bind('first-session').first()).committed_at,now);
    assert.equal(await save('first-session',1),null,'a completed session cannot be written twice');
    assert.equal((await db.prepare('SELECT revision FROM learners WHERE id=?').bind(learnerId).first()).revision,1);
    await create('second-session');
    assert.equal(await save('second-session',0),null,'stale Mini App revision rejected');
    assert.equal((await db.prepare('SELECT committed_at FROM bot_review_sessions WHERE id=?')
      .bind('second-session').first()).committed_at,null);
    assert.equal((await save('second-session',1)).revision,2);
    assert.equal((await db.prepare('SELECT committed_at FROM bot_review_sessions WHERE id=?')
      .bind('second-session').first()).committed_at,now);
  } finally {await mf.dispose();}
});

test('the graded-review migration follows the production speech-budget migration',async()=>{
  const names=(await readdir(new URL('../migrations/',import.meta.url))).sort();
  assert.ok(names.includes('0005_speech_budget.sql'));
  assert.ok(names.includes('0006_bot_review.sql'));
  assert.ok(!names.includes('0004_bot_review.sql'));
  assert.ok(names.indexOf('0006_bot_review.sql')>names.indexOf('0005_speech_budget.sql'));
});

test('Telegram webhook receipts serialize concurrent delivery and allow a failed update to retry',async()=>{
  const mf=new Miniflare(convertV4MiniflareOptions(workerOptions));
  const originalWarn=console.warn;
  try {
    await migrate(mf);
    const db=await mf.getD1Database('DB');
    const held=Promise.withResolvers(), release=Promise.withResolvers();
    const first=receiveTelegramUpdate(db,11,async()=>{
      held.resolve();
      return release.promise;
    });
    await held.promise;
    const duplicate=()=>receiveTelegramUpdate(db,11,()=>assert.fail('duplicate update ran'));
    assert.equal((await duplicate()).status,503);
    release.resolve(new Response('OK'));
    assert.equal((await first).status,200);
    assert.equal((await duplicate()).status,200);

    console.warn=()=>{};
    assert.equal((await receiveTelegramUpdate(db,12,()=>{throw Error('transient');})).status,503);
    assert.equal((await receiveTelegramUpdate(db,12,()=>new Response('OK'))).status,200);
  } finally {
    console.warn=originalWarn;
    await mf.dispose();
  }
});

test('rich and plain Telegram reviews complete against D1 and recover a failed final edit',async()=>{
  const mf=new Miniflare(convertV4MiniflareOptions(workerOptions));
  const originalFetch=globalThis.fetch, originalWarn=console.warn;
  try {
    await migrate(mf);
    const db=await mf.getD1Database('DB');
    const env={DB:db,TELEGRAM_BOT_TOKEN:'test',TELEGRAM_WEBHOOK_SECRET:'test',TELEGRAM_RICH_MESSAGES:'1'};
    const chat={id:42,type:'private'}, from={id:42};
    let screen, updateId=0, lastTap, failEdit=false;
    const post=(update, id=++updateId)=>botWebhook(new Request('https://aytim.test/api/telegram/webhook',{
      method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':'test'},
      body:JSON.stringify({update_id:id,...update})
    }),env);
    globalThis.fetch=async(url,options)=>{
      if(!String(url).startsWith('https://api.telegram.org/'))return originalFetch(url,options);
      const method=new URL(url).pathname.split('/').pop(), payload=JSON.parse(options.body);
      if(method==='answerCallbackQuery')return Response.json({ok:true,result:true});
      if(failEdit&&method==='editMessageText'){
        failEdit=false;
        return Response.json({ok:false,error_code:503},{status:503});
      }
      assert.ok(['sendRichMessage','editMessageText','sendMessage'].includes(method),method);
      screen={...payload,chat,message_id:payload.message_id??77};
      return Response.json({ok:true,result:screen});
    };
    const buttons=()=>screen.rich_message?
      screen.rich_message.blocks.filter(block=>block.type==='buttons').flatMap(block=>block.buttons):
      screen.reply_markup.inline_keyboard.flat();
    const tap=async data=>{
      lastTap={callback_query:{id:String(updateId+1),from,message:screen,data}};
      return post(lastTap);
    };
    const stateForReview=()=>{
      const course=newCourse();
      course.vocabProgress={};
      for(const word of words.filter(word=>word.level===1).slice(0,3)){
        course.cards[word.id]={step:-1,due:0};
        course.vocabProgress[word.id]={introducedAt:10,attempts:0,correct:0,lastAttemptAt:0};
      }
      return {base:'uz',target:'ar',courses:{'uz>ar':course}};
    };
    const state=stateForReview(),now=Date.now();
    await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
      .bind('learner',JSON.stringify(state),now,now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind(String(chat.id),'learner','Test',now,now).run();
    const getRow=()=>db.prepare('SELECT * FROM bot_review_sessions WHERE telegram_id=? ORDER BY created_at DESC LIMIT 1')
      .bind(String(chat.id)).first();
    const progress=()=>db.prepare('SELECT revision,state_json FROM learners WHERE id=?').bind('learner').first();
    const start=()=>post({message:{chat,from,text:'/review'}});

    assert.equal((await start()).status,200);
    const original=await getRow();
    const switchPair=state=>db.prepare('UPDATE learners SET state_json=? WHERE id=?')
      .bind(JSON.stringify(state),'learner').run();
    await switchPair({...state,target:'tr'});
    assert.equal((await tap(buttons().find(item=>item.callback_data?.includes(':c:')).callback_data)).status,200);
    assert.equal((await getRow()).version,original.version);
    assert.equal((await progress()).revision,0);
    await switchPair(state);

    assert.equal(screen.reply_markup,undefined);
    const legacyToggle='rv:'+original.id+':'+original.cursor+':'+original.version+':p:0';
    assert.equal((await tap(legacyToggle)).status,200);
    assert.equal(screen.rich_message,undefined);
    assert.equal((await getRow()).cursor,0);

    for(const plain of [false,true]){
      if(plain)delete env.TELEGRAM_RICH_MESSAGES;
      assert.equal((await start()).status,200);
      assert.equal(Boolean(screen.rich_message),!plain);
      assert.ok(buttons().every(item=>!item.callback_data?.endsWith(':p:0')));
      let row=await getRow(), round=JSON.parse(row.round_json);
      while(row.cursor<round.stages.length){
        if(row.pending_feedback_json){
          const next=buttons().find(item=>item.callback_data?.endsWith(':n:0'));
          assert.equal(next.text,'➡️ Keyingi savol');
          assert.equal(next.style,'primary');
          assert.equal((await tap(next.callback_data)).status,200);
          assert.equal((await getRow()).evaluations_json,row.evaluations_json);
          row=await getRow();
          continue;
        }
        const stage=round.stages[row.cursor];
        const action=stage.kind==='choice'?'c':row.selected_source?'t':'s';
        const options=stage.kind==='choice'?stage.options:row.selected_source?stage.targets:stage.sources;
        const answer=options.findIndex(option=>option.id===(stage.entry??row.selected_source??stage.sources[0].id));
        const wrong=plain&&(action==='c'&&row.cursor===0 || action==='t'&&stage.direction==='reverse');
        const index=wrong?(answer+1)%options.length:answer;
        const data=buttons().find(item=>item.callback_data?.endsWith(':'+action+':'+index))?.callback_data;
        assert.ok(data);
        const last=action==='t'&&row.cursor===round.stages.length-1;
        failEdit=plain&&last;
        if(failEdit)console.warn=()=>{};
        assert.equal((await tap(data)).status,plain&&last?503:200);
        if(plain&&last)assert.equal((await post(lastTap,updateId)).status,200);
        row=await getRow();
        if(action==='c'){
          const output=plain?screen.text:JSON.stringify(screen.rich_message);
          assert.ok(output.includes(stage.prompt));
          assert.match(output,wrong?/Sizning javobingiz:.*To‘g‘ri javob:/s:/✓ To‘g‘ri —/);
          const graded=row.evaluations_json;
          assert.equal((await tap(data)).status,200);
          assert.equal((await getRow()).evaluations_json,graded);
          assert.ok(buttons().some(item=>item.callback_data?.endsWith(':n:0')));
        }
      }
      const expected=plain?'2/4':'4/4';
      const output=plain?screen.text:JSON.stringify(screen.rich_message);
      assert.match(output,new RegExp('To‘g‘ri: '+expected));
      const saved=await progress();
      assert.equal(saved.revision,plain?2:1);
      assert.ok(row.committed_at);
      assert.equal(JSON.parse(saved.state_json).courses['uz>ar'].cards[round.entries[0]].step,plain?-1:0);
      assert.equal((await post(lastTap,updateId)).status,200);
      assert.equal((await progress()).revision,saved.revision);
      if(!plain)await switchPair(stateForReview());
    }
  } finally {
    globalThis.fetch=originalFetch;
    console.warn=originalWarn;
    await mf.dispose();
  }
});
