import { words } from '../dist/words.mjs';
import { reviewQueue, pairKey, saveReview } from '../dist/engine.mjs';
import { createReviewRound, scoreReviewRound, ensureObjectiveReview } from '../dist/vocabulary-review.mjs';
import { recordObjectiveVocabularyReview } from '../dist/vocabulary-progress.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { recordJourney } from '../dist/journey.mjs';
import { recordActivity } from '../dist/home-progress.mjs';
import { chatLabel, continuationKeyboard, homeButton, languageDirection, primaryButton } from './telegram-navigation.mjs';
import { chatBase, chatText as t } from './telegram-copy.mjs';
import { deliverLearningCard, learningCard } from './telegram-rich.mjs';

// Full, objectively graded word review uses the same four checks and spaced
// review engine as the Mini App. The bot is authoritative, never the buttons.
const catalog = new Map(words.map(word => [word.id, word]));
const life = 30 * 60 * 1000;
const parse = JSON.parse;
const id = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
// A button names the screen it was drawn for (session, stage and version), so a tap
// that arrives late or twice can never be applied to a later screen.
const button = (label, row, action, index) => ({
  text: label.slice(0, 60),
  callback_data: 'rv:' + row.id + ':' + row.cursor + ':' + (row.version ?? 0) + ':' + action + ':' + index
});
// Activity time: the gaps between answers, each capped like the Mini App's activity clock.
const answerGap = 90 * 1000;

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

export function renderChatReview(row) {
  const base = row.pair?.split('>')[0];
  const round = parse(row.round_json);
  const answer = parse(row.pending_feedback_json ?? 'null');
  if (answer) {
    const next = primaryButton(button('➡️ ' + t(base, 'next'), row, 'n', 0));
    return learningCard(chatLabel('review',base), answerParagraphs(answer, base), { inline_keyboard: [[next], [homeButton(base)]] });
  }
  const stage = round.stages[row.cursor];
  if (!stage) return learningCard(t(base,'reviewEnded'), [], { inline_keyboard: [[homeButton(base)]] });
  const context = reviewContext(round, stage, row.cursor, base);
  if (stage.kind === 'choice') {
    return learningCard(chatLabel('review',base), [context, { text: stage.prompt, bold: true }, t(base,'chooseTranslation')], {
      inline_keyboard:[
        ...stage.options.map((option,index) => [button(option.text,row,'c',index)]), [homeButton(base)]
      ]
    });
  }
  const matched = new Set(parse(row.matches_json));
  const source = stage.sources.find(item => item.id === row.selected_source);
  return learningCard(chatLabel('review',base), [
    context,
    t(base, 'match') + ' · ' + matched.size + '/' + stage.sources.length,
    ...(source ? [{ text: source.text, bold: true }, t(base,'chooseMeaning')] :
      [t(base,'chooseWordMatch')])
  ],{
    inline_keyboard:source ? [
      ...stage.targets.map((entry,index) => [button(entry.text,row,'t',index)]),
      [button(t(base,'otherWord'), row, 'x', 0), homeButton(base)]
    ] : [
      ...stage.sources.filter(entry => !matched.has(entry.id))
        .map(entry => [button(entry.text,row,'s',stage.sources.indexOf(entry))]),
      [homeButton(base)]
    ]
  });
}

function answerParagraphs(answer, base) {
  const feedback = answer.correct ? t(base, 'answerRight', { answer: answer.expected }) :
    '✗ ' + t(base, 'yourAnswer', { answer: answer.selected }) + '\n✓ ' + t(base, 'correctAnswer') + ': ' + answer.expected;
  return [answer.context, { text: answer.prompt, bold: true }, feedback];
}

function reviewContext(round, stage, cursor, base) {
  return languageDirection(stage.from, stage.to, base) + ' · ' + (cursor + 1) + '/' + round.stages.length;
}

// Parses review button data. Buttons drawn before versions were added carry none;
// they are treated as stale, so the learner gets fresh buttons instead of a grade.
export function parseReviewTap(data) {
  const m=/^rv:([0-9a-f]{20}):(\d{1,2}):(?:(\d{1,6}):)?([cstxfpn]):(\d)$/.exec(data??'');
  if(!m)return null;
  return {key:m[1],cursor:Number(m[2]),version:m[3]===undefined?null:Number(m[3]),action:m[4],index:Number(m[5])};
}

// 'gone': the session or its message no longer exists (or expired unfinished).
// 'stale': the tap was drawn for an earlier screen of this session.
// 'current': it belongs to the screen the learner sees now.
export function reviewTapState(row, message, tap, now = Date.now()) {
  if(!row||row.message_id!==message?.message_id||(row.expires_at<=now&&!row.committed_at))return 'gone';
  if(row.cursor!==tap.cursor||tap.version===null||(row.version ?? 0)!==tap.version)return 'stale';
  return 'current';
}

// Seconds actually spent: from the start to each answer, with every gap capped, so
// time away from the chat is not counted. Answers saved before timestamps were
// added fall back to at most one capped gap per answer.
export function activeReviewSeconds(createdAt, evaluations, now = Date.now()) {
  if(evaluations.some(answer => !Number.isFinite(answer.at)))
    return Math.round(Math.min(Math.max(0, now-createdAt), answerGap*evaluations.length)/1000);
  let last=createdAt, total=0;
  for(const {at} of evaluations){ total+=Math.min(Math.max(0, at-last), answerGap); last=at; }
  return Math.round(total/1000);
}

export function applyReviewTap(row, action, index, now = Date.now()) {
  const round = parse(row.round_json), stage=round.stages[row.cursor];
  if (row.committed_at || !Number.isInteger(index) || index < 0 || index > 9) return null;
  if (!stage) return null;
  if (row.pending_feedback_json != null) {
    if (action !== 'n' || index !== 0) return null;
    return {
      cursor: row.cursor,
      selected_source: row.selected_source,
      matches_json: row.matches_json,
      evaluations_json: row.evaluations_json,
      pending_feedback_json: null,
      finished: false
    };
  }
  const evaluations=parse(row.evaluations_json), matches=parse(row.matches_json);
  let cursor=row.cursor, source=row.selected_source, answer=null;
  if (stage.kind==='choice' && action==='c') {
    const selected=stage.options[index];
    if (!selected)return null;
    const correct=selected.id===stage.entry;
    evaluations.push({id:stage.entry,direction:stage.direction,format:'choice',correct,at:now});
    answer = { correct, selected: selected.text, prompt: stage.prompt,
      expected: stage.options.find(item => item.id === stage.entry).text };
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
      evaluations.push({id:source,direction:stage.direction,format:'match',correct,at:now});
      answer = { correct, selected: target.text, prompt: stage.sources.find(item => item.id === source).text,
        expected: stage.targets.find(item => item.id === source).text };
      matches.push(source);source=null;
      if(matches.length===stage.sources.length)cursor++;
    } else return null;
  } else return null;
  const finished = cursor === round.stages.length;
  return {
    cursor, selected_source:source,
    matches_json: JSON.stringify(cursor===row.cursor?matches:[]),
    evaluations_json:JSON.stringify(evaluations),
    pending_feedback_json: answer ?
      JSON.stringify({ ...answer, context: reviewContext(round, stage, row.cursor, row.pair?.split('>')[0]) }) : null,
    finished
  };
}

async function getRow(db,key,telegramId){
  return db.prepare('SELECT * FROM bot_review_sessions WHERE id=? AND telegram_id=?')
    .bind(key,telegramId).first();
}

async function updateMessage(env,call,chatId,row,screen,{ fresh = false, plain = false } = {}) {
  const sent=await deliverLearningCard(env,call,chatId,screen,{
    messageId:fresh?undefined:row.message_id,
    plain
  });
  if(sent?.message_id&&sent.message_id!==row.message_id)await env.DB.prepare(
    'UPDATE bot_review_sessions SET message_id=? WHERE id=? AND telegram_id=? AND message_id IS ? AND version=?'
  ).bind(sent.message_id,row.id,row.telegram_id,row.message_id,row.version).run();
  return sent;
}

export async function startGradedReview(env,call,telegramId,learner,onEmpty,fallbackBase) {
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
  if(existing && !existing.message_id && Date.now()-existing.created_at < 8000)
    throw new Error('First review delivery is pending');
  if(existing && existing.cursor>=parse(existing.round_json).stages.length){
    await finishReview(env,call,telegramId,existing);
    return;
  }
  if(existing){
    await updateMessage(env,call,telegramId,existing,renderChatReview(existing),{fresh:true});
    return;
  }
  const state=currentState;
  const base=chatBase(state?.base,fallbackBase);
  const round=buildChatRound(state);
  if(!round && onEmpty)return onEmpty();
  if(!round)return call(env,'sendMessage',{
    chat_id:telegramId,
    text:t(base,'noReviewWords'),
    reply_markup:continuationKeyboard(env,{review:true,base})
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
      // A retry can recover the round if its first delivery failed.
      if (!active?.message_id) throw new Error('First review delivery is pending');
      return startGradedReview(env,call,telegramId,learner,onEmpty,fallbackBase);
    }
    throw error;
  }
  const row=await getRow(env.DB,key,telegramId);
  await updateMessage(env,call,telegramId,row,renderChatReview(row));
}

async function saveCompletedReview(env,telegramId,row,now=Date.now()){
  const base=row.pair.split('>')[0];
  const round=parse(row.round_json);
  if(row.cursor!==round.stages.length)return {error:t(base,'reviewIncomplete')};
  const evaluation=parse(row.evaluations_json);
  const result=scoreReviewRound(round.entries.map(id=>({id})),evaluation);
  for(let attempt=0;attempt<5;attempt++){
    const stored=await getRow(env.DB,row.id,telegramId);
    if(stored?.committed_at)return {result};
    const learner=await env.DB.prepare('SELECT l.id,l.state_json,l.revision FROM learners l '+
      'JOIN telegram_accounts a ON a.learner_id=l.id WHERE l.id=? AND a.telegram_id=?')
      .bind(row.learner_id,telegramId).first();
    if(!learner?.state_json)return {error:t(base,'profileMissing')};
    let state;
    try{state=validateState(parse(learner.state_json));}
    catch{return {error:t(base,'progressUnreadable')};}
    if(pairKey(state.base,state.target)!==row.pair)
      return {error:t(base,'pairChanged')};
    const course=state.courses[row.pair];
    if(!course || round.entries.some(key => !catalog.has(key) || !course.cards?.[key] ||
      !course.vocabProgress?.[key] || catalog.get(key).level>(course.journey?.level??1)))
      return {error:t(base,'wordsChanged')};
    ensureObjectiveReview(course,now);
    recordObjectiveVocabularyReview(course,evaluation,now);
    recordJourney(course,result.reviewed,'review',now);
    for(const item of result.reviewed)saveReview(course,item.id,item.correct,now);
    // Mirror the Mini App's finished-review activity and XP accounting.
    // Worker timestamps use UTC until a learner time-zone preference exists.
    recordActivity(course,{
      seconds:Math.min(activeReviewSeconds(row.created_at,evaluation,now),1800),
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
      'AND s.telegram_id=? AND s.committed_at IS NULL AND s.expires_at>? AND EXISTS ('+
      'SELECT 1 FROM telegram_accounts a WHERE a.learner_id=learners.id AND a.telegram_id=s.telegram_id) AND '+
      's.cursor=json_array_length(json_extract(s.round_json,\'$.stages\'))'+
      ') RETURNING revision')
      .bind(JSON.stringify(validated),now,row.id,learner.id,learner.revision,
        row.id,telegramId,now).first();
    if(changed)return {result};
  }
  return {error:t(base,'progressChanged')};
}

async function finishReview(env,call,id,row,options) {
  const saved=await saveCompletedReview(env,id,row);
  const retry='rv:'+row.id+':'+row.cursor+':'+(row.version??0)+':f:0';
  const [base,target]=row.pair.split('>');
  const answer=parse(row.pending_feedback_json ?? 'null');
  const mistakes=saved.result?.reviewed.filter(item=>!item.correct)
    .map(item=>catalog.get(item.id)).filter(Boolean)
    .map(word=>'• '+word.text[base]+' — '+word.text[target])??[];
  const screen=saved.error?
    learningCard(t(base,'reviewUnsaved'),[saved.error],{inline_keyboard:[
      [{text:t(base,'retrySave'),callback_data:retry,style:'primary'}],[homeButton(base)]
    ]}):
    learningCard(t(base,'reviewDone'),[
      ...(answer ? answerParagraphs(answer, base) : []),
      t(base,'reviewScore',{score:saved.result.correct+'/'+saved.result.total})+'\n'+
        t(base,'reviewPassed',{score:saved.result.passed+'/'+saved.result.reviewed.length}),
      ...(mistakes.length?[t(base,'reviewMisses')+'\n'+mistakes.join('\n')]:[]),
      t(base,'reviewSynced')
    ],continuationKeyboard(env,{review:true,base}));
  await updateMessage(env,call,id,saved.error?row:{...row,committed_at:true},screen,options);
}

export async function gradedReviewCallback(env,call,telegramId,message,callbackId,data,languageCode){
  const tap=parseReviewTap(data);
  if(!tap)return false;
  const {key,action,index}=tap;
  const row=await getRow(env.DB,key,telegramId);
  const base=chatBase(row?.pair.split('>')[0],languageCode);
  const status=reviewTapState(row,message,tap);
  const plain=action==='p'||!message?.rich_message;
  if(status==='gone'){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId,
      text:t(base,'reviewExpired')});
    return true;
  }
  const finished=row.cursor===parse(row.round_json).stages.length;
  if(finished){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId});
    await finishReview(env,call,telegramId,row,{plain});
    return true;
  }
  const active=await env.DB.prepare(
    "SELECT json_extract(l.state_json,'$.base') AS base,json_extract(l.state_json,'$.target') AS target "+
    'FROM learners l JOIN telegram_accounts a ON a.learner_id=l.id WHERE a.telegram_id=? AND l.id=?'
  ).bind(telegramId,row.learner_id).first();
  if(pairKey(active?.base,active?.target)!==row.pair){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId,
      text:t(base,'reviewPairChanged')});
    return true;
  }
  if(status==='stale'||action==='p'){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId,
      text:action==='p'?t(base,'plainButtons'):t(base,'screenRefreshed')});
    await updateMessage(env,call,telegramId,row,renderChatReview(row),{plain});
    return true;
  }
  const next=applyReviewTap(row,action,index);
  if(!next){
    await call(env,'answerCallbackQuery',{callback_query_id:callbackId,text:t(base,'anotherAnswer')});
    return true;
  }
  const saved=await env.DB.prepare('UPDATE bot_review_sessions SET cursor=?,'+
    'selected_source=?,matches_json=?,evaluations_json=?,pending_feedback_json=?,version=version+1 '+
    'WHERE id=? AND telegram_id=? AND message_id=? AND cursor=? AND version=? AND committed_at IS NULL AND expires_at>? AND EXISTS ('+
    'SELECT 1 FROM learners l JOIN telegram_accounts a ON a.learner_id=l.id '+
    'WHERE l.id=bot_review_sessions.learner_id AND a.telegram_id=bot_review_sessions.telegram_id AND '+
    "json_extract(l.state_json,'$.base')||'>'||json_extract(l.state_json,'$.target')=bot_review_sessions.pair) "+
    'RETURNING version').bind(next.cursor,next.selected_source,next.matches_json,
      next.evaluations_json,next.pending_feedback_json,key,telegramId,row.message_id,row.cursor,row.version,Date.now()).first();
  await call(env,'answerCallbackQuery',{callback_query_id:callbackId,
    ...(saved ? {} : { text: t(base,'answerAccepted') })});
  if(!saved)return true;
  const current=await getRow(env.DB,key,telegramId);
  if(!current || current.version!==saved.version)return true;
  if(next.finished)await finishReview(env,call,telegramId,current,{plain});
  else await updateMessage(env,call,telegramId,current,renderChatReview(current),{plain});
  return true;
}
