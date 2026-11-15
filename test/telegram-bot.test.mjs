import test from 'node:test';
import assert from 'node:assert/strict';
import { codes } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { newCourse } from '../dist/engine.mjs';
import { questionFor, botWebhook } from '../src/telegram-bot.mjs';
import { practiceWidgetHtml, practiceWidgetData } from '../src/telegram-widgets.mjs';
import { deflateSync } from 'node:zlib';
import { botWebhookSecret, connectTelegramBot, activateTelegramBot } from '../src/telegram-bootstrap.mjs';
import { appKeyboard, dashboardKeyboard, continuationKeyboard, progressKeyboard, miniAppMenuPayload, miniAppUrl, navigationActions } from '../src/telegram-navigation.mjs';

function learner(base='uz',target='tr',level=1) {
  const c=newCourse();
  c.journey={level,evidence:{},recent:{},lastActivity:null};
  // Explicitly introduced/eligible words only, never a future level.
  for(const w of words.filter(w=>w.level===1).slice(0,10)) {
    c.cards[w.id]={step:-1,due:0};
    c.vocabProgress??={};
    c.vocabProgress[w.id]={introducedAt:1,attempts:0,correct:0,lastAttemptAt:0,reviewEvidence:{}};
  }
  return {base,target,courses:{[base+'>'+target]:c}};
}

test('compact widget meets Telegram HTML and state size restrictions',()=>{
  assert.ok(Buffer.byteLength(practiceWidgetHtml)<32768);
  assert.ok(deflateSync(practiceWidgetHtml,{level:9}).length<4096);
  const data=practiceWidgetData({id:'a'.repeat(20),from:'uz',to:'tr',prompt:'oila',
    options:['aile','baba','anne','çocuk']});
  assert.ok(Buffer.byteLength(data)<=1024);
  assert.ok(practiceWidgetHtml.includes('TelegramWidget'));
  assert.ok(practiceWidgetHtml.includes('chatDataChanged'));
  assert.ok(!practiceWidgetHtml.includes('fetch('));
});

test('questions are restricted to introduced vocabulary in all 30 directed pairs',()=>{
  for(const base of codes)for(const target of codes) {
    if(base===target)continue;
    const state=learner(base,target);
    for(let n=0;n<12;n++){
      const question=questionFor(state,()=>n%2?0.1:0.9);
      assert.ok(question,base+'>'+target);
      assert.ok(words.some(w=>w.id===question.entry&&w.level===1));
      assert.ok(question.options.length===4);
      assert.equal(new Set(question.options).size,4);
      assert.equal(question.options[question.correct],
        words.find(w=>w.id===question.entry).text[question.to]);
      assert.ok(question.from===base||question.from===target);
      assert.notEqual(question.from,question.to);
    }
  }
});

test('unintroduced, future-level and empty courses produce no chat quiz',()=>{
  assert.equal(questionFor({base:'uz',target:'tr',courses:{}}),null);
  const s=learner();
  s.courses['uz>tr'].vocabProgress={};
  assert.equal(questionFor(s),null);
  const t=learner();
  for(const w of words.filter(w=>w.level===1).slice(3,10))
    delete t.courses['uz>tr'].cards[w.id];
  assert.equal(questionFor(t),null);
});

test('Telegram webhook requires a configured secret and matching header',async()=>{
  const body=JSON.stringify({update_id:1,message:{chat:{id:12,type:'private'},from:{id:12},text:'/start'}});
  const env={TELEGRAM_BOT_TOKEN:'123:fake',TELEGRAM_WEBHOOK_SECRET:'test-secret'};
  for(const secret of [null,'wrong']) {
    const headers=secret?{'X-Telegram-Bot-Api-Secret-Token':secret}:{};
    const response=await botWebhook(new Request('https://aytim.test/api/telegram/webhook',{
      method:'POST',headers,body
    }),env);
    assert.equal(response.status,401);
  }
});

test('main dashboard offers every action without a typed command',()=>{
  const env={PUBLIC_APP_ORIGIN:'https://aytim.example'};
  const markup=dashboardKeyboard(env,true);
  const callbackButtons=markup.inline_keyboard.flat().filter(item=>item.callback_data);
  assert.deepEqual(new Set(callbackButtons.map(item=>item.callback_data)),
    new Set([navigationActions.practice,navigationActions.progress]));
  const app=markup.inline_keyboard.flat().filter(item=>item.web_app);
  assert.equal(app.length,2);
  assert.ok(app.every(item=>item.web_app.url==='https://aytim.example/'));
  assert.equal(dashboardKeyboard(env,false).inline_keyboard.flat().length,1);
  assert.deepEqual(continuationKeyboard(env).inline_keyboard[0].map(item=>item.callback_data),
    [navigationActions.practice,navigationActions.home]);
  assert.deepEqual(progressKeyboard(env).inline_keyboard[0].map(item=>item.callback_data),
    [navigationActions.practice,navigationActions.home]);
  assert.equal(appKeyboard(env).inline_keyboard[0][0].web_app.url,'https://aytim.example/');
  assert.deepEqual(miniAppMenuPayload(env),{
    menu_button:{type:'web_app',text:'Aytim',web_app:{url:'https://aytim.example/'}}
  });
  assert.equal(miniAppUrl({PUBLIC_APP_ORIGIN:'http://example.com'}),null);
  assert.equal(miniAppUrl({PUBLIC_APP_ORIGIN:'https://aytim.example/wrong'}),null);
});

test('welcome, progress and menu navigation work by tapping Telegram callbacks',async()=>{
  const id=42;
  const account={id:'test-learner',state_json:JSON.stringify(learner())};
  const seen=[];
  const originalFetch=globalThis.fetch;
  const env={
    TELEGRAM_BOT_TOKEN:'123:fake',TELEGRAM_WEBHOOK_SECRET:'secret',
    PUBLIC_APP_ORIGIN:'https://aytim.example',
    DB:{prepare(sql){assert.match(sql,/telegram_accounts/);return{
      bind(user){assert.equal(user,String(id));return{first:async()=>account};}
    };}}
  };
  globalThis.fetch=async (url,options)=>{
    const method=new URL(url).pathname.split('/').pop();
    seen.push({method,payload:JSON.parse(options.body)});
    return Response.json({ok:true,result:{message_id:51}});
  };
  const post=update=>botWebhook(new Request('https://aytim.example/api/telegram/webhook',{
    method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':'secret'},
    body:JSON.stringify(update)
  }),env);
  try {
    const start=await post({message:{from:{id},chat:{id,type:'private'},text:'/start'}});
    assert.equal(start.status,200);
    assert.equal(seen.at(-1).method,'sendMessage');
    assert.equal(seen.at(-1).payload.reply_markup.inline_keyboard[0][0].callback_data,navigationActions.practice);
    seen.length=0;
    const result=await post({callback_query:{id:'cb1',from:{id},message:{
      chat:{id,type:'private'},message_id:51,text:'Main menu'},data:navigationActions.progress}});
    assert.equal(result.status,200);
    assert.deepEqual(seen.map(x=>x.method),['answerCallbackQuery','editMessageText']);
    assert.match(seen[1].payload.text,/Daraja:/);
    assert.deepEqual(seen[1].payload.reply_markup.inline_keyboard[0]
      .map(x=>x.callback_data),[navigationActions.practice,navigationActions.home]);
    seen.length=0;
    await post({callback_query:{id:'cb2',from:{id},message:{
      chat:{id,type:'private'},message_id:51,text:'Progress'},data:navigationActions.home}});
    assert.deepEqual(seen.map(x=>x.method),['answerCallbackQuery','editMessageText']);
    assert.match(seen[1].payload.text,/Qanday davom etamiz/);
  } finally {globalThis.fetch=originalFetch;}
});

test('webhook signing secret defaults to a stable private HMAC, while honoring configured secrets',async()=>{
  const env={TELEGRAM_BOT_TOKEN:'12345:test-bot-secret'};
  const a=await botWebhookSecret(env);
  assert.match(a,/^[0-9a-f]{64}$/);
  assert.equal(a,await botWebhookSecret(env));
  assert.notEqual(a,await botWebhookSecret({TELEGRAM_BOT_TOKEN:'12345:another-secret'}));
  assert.equal(await botWebhookSecret({...env,TELEGRAM_WEBHOOK_SECRET:'explicit_secret'}),'explicit_secret');
  assert.equal(await botWebhookSecret({}),null);
});

test('Worker registers webhook and Mini App menu without exposing a bot token',async()=>{
  const actualFetch=globalThis.fetch, calls=[];
  globalThis.fetch=async (url,options)=>{
    const method=new URL(url).pathname.split('/').pop();
    const payload=JSON.parse(options.body);
    calls.push({method,payload});
    return Response.json({ok:true,result:method==='getWebhookInfo'?{url:''}:true});
  };
  try{
    const env={TELEGRAM_BOT_TOKEN:'12345:test-bot-secret',PUBLIC_APP_ORIGIN:'https://aytim.example'};
    assert.equal(await connectTelegramBot(env),'connected');
    assert.deepEqual(calls.map(row=>row.method),[
      'getWebhookInfo','setWebhook','setChatMenuButton','setMyCommands'
    ]);
    const setup=calls.find(row=>row.method==='setWebhook').payload;
    assert.equal(setup.url,'https://aytim.example/api/telegram/webhook');
    assert.deepEqual(setup.allowed_updates,['message','callback_query','widget_query']);
    assert.equal(setup.secret_token,await botWebhookSecret(env));
    assert.equal(calls.find(row=>row.method==='setChatMenuButton')
      .payload.menu_button.web_app.url,'https://aytim.example/');
    assert.ok(!JSON.stringify(calls).includes(env.TELEGRAM_BOT_TOKEN));
  }finally{globalThis.fetch=actualFetch;}
});

test('Worker does not take over an unrelated existing Telegram webhook',async()=>{
  const original=globalThis.fetch,calls=[];
  globalThis.fetch=async (url,options)=>{
    calls.push(new URL(url).pathname.split('/').pop());
    return Response.json({ok:true,result:{url:'https://other.example/bot'}});
  };
  try{
    const r=await connectTelegramBot({TELEGRAM_BOT_TOKEN:'123:token',
      PUBLIC_APP_ORIGIN:'https://aytim.example'});
    assert.equal(r,'different-webhook');
    assert.deepEqual(calls,['getWebhookInfo']);
  }finally{globalThis.fetch=original;}
});

test('automatic setup requires the explicit deployment flag',()=>{
  let called=false;
  const ctx={waitUntil(){called=true;}};
  activateTelegramBot({TELEGRAM_BOT_TOKEN:'123:token',
    TELEGRAM_AUTO_CONNECT:'0'},ctx);
  assert.equal(called,false);
});
