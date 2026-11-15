import { words } from '../dist/words.mjs';
import { reviewQueue, pairKey, saveReview } from '../dist/engine.mjs';
import { createReviewRound, scoreReviewRound, ensureObjectiveReview } from '../dist/vocabulary-review.mjs';
import { recordObjectiveVocabularyReview } from '../dist/vocabulary-progress.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { recordJourney } from '../dist/journey.mjs';
import { recordActivity } from '../dist/home-progress.mjs';
import { navigationActions, continuationKeyboard } from './telegram-navigation.mjs';

// Full, objectively graded word review uses the same four checks and spaced
// review engine as the Mini App. The bot is authoritative, never the buttons.
const catalog = new Map(words.map(word => [word.id, word]));
const life = 30 * 60 * 1000;
const parse = JSON.parse;
const id = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
const button = (label, key, cursor, action, index) => ({
  text: label.slice(0, 60),
  callback_data: 'rv:' + key + ':' + cursor + ':' + action + ':' + index
});
const homeButton = { text: '🏠 Bosh menyu', callback_data: navigationActions.home };

export function buildChatRound(state, random = Math.random, now = Date.now()) {
  const base = state?.base, target = state?.target;
  const course = state?.courses?.[pairKey(base, target)];
  if (!course || !base || !target || base === target) return null;
  const level = course.journey?.level ?? 1;
  // Distractors must also have been introduced, never future-level material.
  const pool = words.filter(entry => entry.level <= level && course.cards?.[entry.id] &&
    course.vocabProgress?.[entry.id] && entry.text[base] && entry.text[target]);
  const allowed = new Set(pool.map(entry => entry.id));
  const queue = reviewQueue(course, false, now).filter(entry => allowed.has(entry.id)).slice(0, 4);
  if (!queue.length || pool.length < 3) return null;
  // Two distinct distractors must remain outside the assessed batch.
  // A beginner with only 3–5 introduced words still receives a smaller,
  // complete four-check round instead of being blocked until six words.
  for (let size = Math.min(4, queue.length, pool.length-2); size >= 1; size--) {
    let round;
    try { round = createReviewRound(queue.slice(0,size), pool, base, target, random); }
    catch (error) {
      if (error instanceof RangeError) continue;
      throw error;
    }
    return {
      entries: round.entries.map(entry => entry.id),
      stages: round.stages.map(stage => stage.kind === 'choice' ? {
        kind: 'choice', entry: stage.entry.id, from: stage.from, to: stage.to,
        direction: stage.direction, prompt: stage.entry.text[stage.from],
        options: stage.options.map(entry => ({id: entry.id, text:entry.text[stage.to]}))
      } : {
        kind: 'match', direction: stage.direction, from: stage.from, to: stage.to,
        // Each *due* source is graded once; fillers are distractors only.
        sources: stage.sources.filter(entry => stage.gradedIds.includes(entry.id))
          .map(entry => ({id:entry.id,text:entry.text[stage.from]})),
        targets: stage.targets.map(entry => ({id:entry.id,text:entry.text[stage.to]}))
      }),
      total: round.total
    };
  }
  return null;
}

export function renderChatReview(row, feedback = '') {
  const round = parse(row.round_json), stage = round.stages[row.cursor];
  if (!stage) return {text:'Takrorlash tugadi.',reply_markup:{inline_keyboard:[[homeButton]]}};
  const heading = (feedback ? feedback + '\n\n' : '') +
    '🧠 Takrorlash · '+(row.cursor+1)+'/'+round.stages.length+' bosqich' +
    '\n' + stage.from.toUpperCase() + ' → ' + stage.to.toUpperCase() + '\n\n';
  if (stage.kind === 'choice') {
    return {text: heading + 'To‘g‘ri tarjimani tanlang:\n\n' + stage.prompt,
      reply_markup:{inline_keyboard:[
        ...stage.options.map((option,index) => [button(option.text,row.id,row.cursor,'c',index)]),
        [homeButton]
      ]}};
  }
  const matched = new Set(parse(row.matches_json));
  const source = stage.sources.find(item => item.id === row.selected_source);
  return {
    text:heading+'🧩 Juftlash · '+matched.size+'/'+stage.sources.length+
      '\n'+(source ? '«'+source.text+'» so‘zining tarjimasini tanlang.' :
        'So‘zni tanlang, keyin uning tarjimasini toping.'),
    reply_markup:{inline_keyboard:source ? [
      ...stage.targets.map((entry,index) => [button(entry.text,row.id,row.cursor,'t',index)]),
      [button('↩️ Boshqa so‘z',row.id,row.cursor,'x',0)], [homeButton]
    ] : [
      ...stage.sources.filter(entry => !matched.has(entry.id))
        .map(entry => [button(entry.text,row.id,row.cursor,'s',stage.sources.indexOf(entry))]),
      [homeButton]
    ]}
  };
}

export function applyReviewTap(row, action, index) {
  const round = parse(row.round_json), stage=round.stages[row.cursor];
  if (!stage || row.committed_at || !Number.isInteger(index) || index<0 || index>9) return null;
  const evaluations=parse(row.evaluations_json), matches=parse(row.matches_json);
  let cursor=row.cursor, source=row.selected_source, feedback='';
  if (stage.kind==='choice' && action==='c') {
    const selected=stage.options[index];
    if (!selected)return null;
    const correct=selected.id===stage.entry;
    evaluations.push({id:stage.entry,direction:stage.direction,format:'choice',correct});
    feedback=correct?'✓ To‘g‘ri!':'To‘g‘ri javob: '+stage.options.find(e=>e.id===stage.entry).text;
    cursor++;
  } else if (stage.kind==='match') {
    if (action==='s' && !source) {
      const selected=stage.sources[index];
      if (!selected || matches.includes(selected.id))return null;
      source=selected.id;
    } else if (action==='x' && source) source=null;
    else if (action==='t' && source) {
      const target=stage.targets[index];
      if (!target)return null;
      const correct=source===target.id;
      evaluations.push({id:source,direction:stage.direction,format:'match',correct});
      feedback=correct?'✓ To‘g‘ri!':'To‘g‘ri javob: '+stage.targets.find(e=>e.id===source).text;
      matches.push(source);source=null;
      if(matches.length===stage.sources.length)cursor++;
    } else return null;
  } else return null;
  return {
    cursor, selected_source:source,
    matches_json: JSON.stringify(cursor===row.cursor?matches:[]),
    evaluations_json:JSON.stringify(evaluations),
    feedback, finished:cursor===round.stages.length
  };
}

async function getRow(db,key,telegramId){
  return db.prepare('SELECT * FROM bot_review_sessions WHERE id=? AND telegram_id=?')
    .bind(key,telegramId).first();
}

async function updateMessage(env,call,chatId,row,screen) {
  if(row.message_id){
    try {return await call(env,'editMessageText',{
      chat_id:chatId,message_id:row.message_id,text:screen.text,
      reply_markup:screen.reply_markup
    });} catch { /* Edited/deleted message is replaced with a fresh one. */ }
  }
  const sent=await call(env,'sendMessage',{
    chat_id:chatId,text:screen.text,reply_markup:screen.reply_markup
  });
  if(sent?.message_id)await env.DB.prepare(
    'UPDATE bot_review_sessions SET message_id=? WHERE id=? AND telegram_id=?'
  ).bind(sent.message_id,row.id,row.telegram_id).run();
  return sent;
}

export async function startGradedReview(env,call,telegramId,learner) {
  // A bounded sweep avoids retaining answers and session keys indefinitely.
  await env.DB.prepare('DELETE FROM bot_review_sessions WHERE id IN ('+
    'SELECT id FROM bot_review_sessions WHERE expires_at<? LIMIT 20)')
    .bind(Date.now()-7*86400000).run();
  // An expired, uncommitted session cannot monopolize the one-active lock.
  await env.DB.prepare('DELETE FROM bot_review_sessions WHERE telegram_id=? AND committed_at IS NULL AND expires_at<=?')
    .bind(telegramId,Date.now()).run();
  // Resume unfinished work instead of sending a new 16-check review each tap.
  let existing=await env.DB.prepare(
    'SELECT * FROM bot_review_sessions WHERE telegram_id=? AND committed_at IS NULL AND expires_at>? ORDER BY created_at DESC LIMIT 1'
  ).bind(telegramId,Date.now()).first();
  let currentState;
  try { currentState=parse(learner?.state_json??'null'); } catch { currentState=null; }
  // Switching the active language pair invalidates an unfinished review.
  // It never writes credit to another course by mistake.
  if(existing && existing.pair!==pairKey(currentState?.base,currentState?.target)){
    await env.DB.prepare('DELETE FROM bot_review_sessions WHERE id=? AND telegram_id=? AND committed_at IS NULL')
      .bind(existing.id,telegramId).run();
    existing=null;
  }
  if(existing && !existing.message_id && Date.now()-existing.created_at < 5000)
    return; // First send is still in flight; avoid a duplicate question bubble.
  if(existing && existing.cursor>=parse(existing.round_json).stages.length){
    await finishReview(env,call,telegramId,existing);
    return;
  }
  if(existing){
    const view=renderChatReview(existing);
    const sent=await call(env,'sendMessage',{chat_id:telegramId,text:view.text,reply_markup:view.reply_markup});
    if(sent?.message_id)await env.DB.prepare('UPDATE bot_review_sessions SET message_id=? WHERE id=?')
      .bind(sent.message_id,existing.id).run();
    return;
  }
  const state=currentState;
  const round=buildChatRound(state);
  if(!round)return call(env,'sendMessage',{
    chat_id:telegramId,
    text:'Hozir takrorlanishi kerak bo‘lgan yetarli so‘z yo‘q. Yangi darsni tugating yoki keyinroq qayting.',
    reply_markup:continuationKeyboard(env)
  });
  const key=id(),now=Date.now();
  try {
    await env.DB.prepare('INSERT INTO bot_review_sessions '+
      '(id,telegram_id,learner_id,pair,round_json,created_at,expires_at) VALUES(?,?,?,?,?,?,?)')
      .bind(key,telegramId,learner.id,pairKey(state.base,state.target),JSON.stringify(round),now,now+life).run();
  } catch(error) {
    // Simultaneous taps can both see "no active review". The unique partial
    // index serializes them; the loser resumes the winner instead of spawning
    // another round (and potentially earning duplicate XP).
    if (/UNIQUE constraint failed/i.test(String(error.message))) {
      const active=await env.DB.prepare('SELECT message_id FROM bot_review_sessions '+
        'WHERE telegram_id=? AND committed_at IS NULL AND expires_at>? LIMIT 1')
        .bind(telegramId,Date.now()).first();
      // The winning request is still sending its first message: no duplicate.
      if (!active?.message_id) return;
      return startGradedReview(env,call,telegramId,learner);
    }
    throw error;
  }
  const row=await getRow(env.DB,key,telegramId);
  await updateMessage(env,call,telegramId,row,renderChatReview(row));
}

async function saveCompletedReview(env,telegramId,row,now=Date.now()){
  const round=parse(row.round_json);
  if(row.cursor!==round.stages.length)return {error:'Takrorlash hali tugamadi.'};
  const evaluation=parse(row.evaluations_json);
  const result=scoreReviewRound(round.entries.map(id=>({id})),evaluation);
  for(let attempt=0;attempt<5;attempt++){
    const stored=await getRow(env.DB,row.id,telegramId);
    if(stored?.committed_at)return {result};
    const learner=await env.DB.prepare('SELECT id,state_json,revision FROM learners WHERE id=?')
      .bind(row.learner_id).first();
    if(!learner?.state_json)return {error:'Profil topilmadi.'};
    let state;
    try{state=validateState(parse(learner.state_json));}
    catch{return {error:'Progressni o‘qib bo‘lmadi.'};}
    const course=state.courses[row.pair];
    if(!course || round.entries.some(key => !catalog.has(key) || !course.cards?.[key] ||
      !course.vocabProgress?.[key] || catalog.get(key).level>(course.journey?.level??1)))
      return {error:'So‘zlar yoki daraja o‘zgargan. Ilovada sinxronlang.'};
    ensureObjectiveReview(course,now);
    recordObjectiveVocabularyReview(course,evaluation,now);
    recordJourney(course,result.reviewed,'review',now);
    for(const item of result.reviewed)saveReview(course,item.id,item.correct,now);
    // Mirror the Mini App's finished-review activity and XP accounting.
    // Worker timestamps use UTC until a learner time-zone preference exists.
    recordActivity(course,{
      seconds:Math.max(0,Math.min(Math.round((now-row.created_at)/1000),1800)),
      correct:result.correct,
      recalled:result.reviewed.filter(item=>item.correct).map(item=>item.id)
    },now);
    const validated=validateState(state);
    // 0006's AFTER UPDATE trigger consumes this session in the *same* write.
    // CAS + the uncommitted-session clause reject both duplicate delivery and
    // concurrent Mini App writes. Retrying after conflict recomputes progress.
    const changed=await env.DB.prepare('UPDATE learners SET state_json=?,revision=revision+1,'+
      'updated_at=?,last_bot_review_session_id=? WHERE id=? AND revision=? AND EXISTS ('+
      'SELECT 1 FROM bot_review_sessions s WHERE s.id=? AND s.learner_id=learners.id '+
      'AND s.telegram_id=? AND s.committed_at IS NULL AND s.expires_at>? AND '+
      's.cursor=json_array_length(json_extract(s.round_json,\'$.stages\'))'+
      ') RETURNING revision')
      .bind(JSON.stringify(validated),now,row.id,learner.id,learner.revision,
        row.id,telegramId,now).first();
    if(changed)return {result};
  }
  return {error:'Progress o‘zgardi. Qayta urinib ko‘ring.'};
}

async function finishReview(env,call,id,row) {
  const saved=await saveCompletedReview(env,id,row);
  const retry='rv:'+row.id+':'+row.cursor+':f:0';
  const [base,target]=row.pair.split('>');
  const mistakes=saved.result?.reviewed.filter(item=>!item.correct)
    .map(item=>catalog.get(item.id)).filter(Boolean)
    .map(word=>'• '+word.text[base]+' — '+word.text[target])??[];
  await updateMessage(env,call,id,row,saved.error?{
    text:'Takrorlash yakunlandi, lekin natija saqlanmadi.\n'+saved.error,
    reply_markup:{inline_keyboard:[
      [{text:'↻ Saqlashni qayta urinish',callback_data:retry}],[homeButton]
    ]}
  }:{
    text:'✅ Takrorlash yakunlandi!\n\nTo‘g‘ri: '+saved.result.correct+'/'+saved.result.total+
      '\nKeyingi bosqichga o‘tgan so‘zlar: '+saved.result.passed+'/'+saved.result.reviewed.length+
      (mistakes.length?'\n\nQayta ko‘rish kerak:\n'+mistakes.join('\n'):'')+
      '\n\nNatija Aytim bilan sinxronlandi.',
    reply_markup:continuationKeyboard(env)
  });
}

export async function gradedReviewCallback(env,call,telegramId,message,callbackId,data){
  const m=/^rv:([0-9a-f]{20}):(\d{1,2}):([cstxf]):(\d)$/.exec(data??'');
  if(!m)return false;
  const [,key,cursor,action,index]=m;
  const row=await getRow(env.DB,key,telegramId);
  if(!row||row.message_id!==message?.message_id||
      row.cursor!==Number(cursor)||(row.expires_at<=Date.now()&&!row.committed_at)){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId,
      text:'Savol eskirgan. Takrorlashni qaytadan boshlang.'});
    return true;
  }
  if(action==='f' && row.cursor===parse(row.round_json).stages.length){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId});
    await finishReview(env,call,telegramId,row);
    return true;
  }
  const next=applyReviewTap(row,action,Number(index));
  if(!next){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId,text:'Boshqa javobni tanlang.'});
    return true;
  }
  const saved=await env.DB.prepare('UPDATE bot_review_sessions SET cursor=?,'+
    'selected_source=?,matches_json=?,evaluations_json=?,version=version+1 '+
    'WHERE id=? AND telegram_id=? AND cursor=? AND version=? AND committed_at IS NULL '+
    'RETURNING version').bind(next.cursor,next.selected_source,next.matches_json,
      next.evaluations_json,key,telegramId,row.cursor,row.version).first();
  await call(env,'answerCallbackQuery',{callback_query_id:callbackId,
    text:saved?(next.feedback||'Tanlandi'):'Javob qabul qilingan.'});
  if(!saved)return true;
  const current=await getRow(env.DB,key,telegramId);
  if(next.finished)await finishReview(env,call,telegramId,current);
  else await updateMessage(env,call,telegramId,current,renderChatReview(current,next.feedback));
  return true;
}
