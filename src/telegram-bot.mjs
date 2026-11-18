import { words } from '../dist/words.mjs';
import { reviewQueue, pairKey, searchText, shuffled } from '../dist/engine.mjs';
import { practiceWidgetHtml, practiceWidgetData } from './telegram-widgets.mjs';
import { appKeyboard, chatLabel, chatLanguage, dashboardKeyboard, continuationKeyboard, homeButton, languageDirection,
  progressKeyboard, navigationActions, navigationButton, primaryButton, vocabularyCompanion } from './telegram-navigation.mjs';
import { chatBase, chatText as t } from './telegram-copy.mjs';
import { botWebhookSecret } from './telegram-bootstrap.mjs';
import { startGradedReview, gradedReviewCallback } from './telegram-review.mjs';
import { TelegramApiError, deliverLearningCard, learningCard, messageText } from './telegram-rich.mjs';
import { receiveTelegramUpdate } from './telegram-receipts.mjs';
import { curriculumAudio, resolveAudio } from './speech.mjs';
import { checkSpeaking, startSpeaking } from './telegram-speaking.mjs';
import { startStory, storyCallback } from './telegram-stories.mjs';
import { reminderSettings, reminderCallback, setReminderZone, runReviewReminders, showWeeklyRecap } from './telegram-reminders.mjs';
import { privatePracticeCallback, privatePracticeMenu, startPrivatePractice } from './telegram-private-practice.mjs';

// A standalone practice question is diagnostic, never four-check vocabulary review.
// Telegram currently rejects sendWidget for some bots; avoid retrying an API
// operation known to be blocked on every question (retry after one hour).
let widgetUnavailableUntil = 0;

export function quickAnswerKeyboard(id, options) {
  return {inline_keyboard: options.map((value,i)=>[{
    text:value.slice(0,60),callback_data:'a:'+id+':'+i
  }])};
}
async function telegram(env, method, payload) {
  const multipart=payload instanceof FormData;
  const response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{
    method:'POST',...(multipart?{}:{headers:{'Content-Type':'application/json'}}),
    body:multipart?payload:JSON.stringify(payload),
    signal:AbortSignal.timeout(8000)
  });
  const value=await response.json().catch(()=>null);
  if(!response.ok||!value?.ok){
    const error=new TelegramApiError(method,value?.error_code??response.status,value?.description);
    if(method==='answerCallbackQuery'&&error.callbackExpired)return null;
    throw error;
  }
  return value.result;
}

export function sendScheduledReminders(env) {
  return runReviewReminders(env, telegram);
}

const send=(env,id,content,reply_markup=appKeyboard(env))=>telegram(env,'sendMessage',{
  chat_id:id,...(typeof content==='string'?{text:content}:content),...(reply_markup?{reply_markup}:{})
});
// Reuse a text dashboard message when a navigation callback can edit it.
// Widgets cannot be replaced using editMessageText; send a new menu there.
async function show(env,id,content,keyboard,message){
  if(message?.text && message?.message_id){
    try{return await telegram(env,'editMessageText',{
      chat_id:id,message_id:message.message_id,...(typeof content==='string'?{text:content}:content),...(keyboard?{reply_markup:keyboard}:{})
    });}catch(error){
      // Telegram rejects a no-op edit; don't replace it with another bubble.
      if(error.notModified)return null;
      if(error.code!==400)throw error;
    }
  }
  return send(env,id,content,keyboard);
}
function dashboardContent(env, learner, base) {
  if (vocabularyCompanion(env)) return messageText('Aytim', [learner
    ? t(base,'practiceWords')
    : t(base,'linkVocabulary')]);
  const state = stateOf(learner);
  return messageText('Aytim', learner ? [
    state && languageDirection(state.base, state.target, base),
    t(base,'slogan')
  ] : [t(base,'linkLessons')]);
}
function dashboard(env,id,learner,message,base){
  return show(env,id,dashboardContent(env,learner,base),dashboardKeyboard(env,Boolean(learner),base),message);
}
function progressContent(learner,base){
  const s=stateOf(learner),c=s&&courseOf(s);
  return messageText(chatLabel('progress',base), s ? [
    languageDirection(s.base, s.target, base),
    t(base,'level',{level:c?.journey?.level??1}) + '\n' + t(base,'reviewDue',{n:c?reviewQueue(c).length:0})
  ] : [t(base,'choosePair')]);
}
function progressView(env,id,learner,message,base){
  return show(env,id,progressContent(learner,base),progressKeyboard(env,base),message);
}
function fullReview(env,id,learner,base){
  return startGradedReview(env,telegram,id,learner,undefined,base);
}
function startVocabularyPractice(env,id,learner,message,base){
  return startGradedReview(env,telegram,id,learner,()=>begin(env,id,learner,message,{base}),base);
}
async function navigate(env,ctx,id,action,message,languageCode){
  const learner=await member(env.DB,id);
  const state=stateOf(learner);
  const base=chatBase(state?.base,languageCode);
  if(action===navigationActions.home)return dashboard(env,id,learner,message,base);
  if(!learner)return dashboard(env,id,null,message,base);
  if(action===navigationActions.reminders)return reminderSettings(env,telegram,id,message,base);
  if(vocabularyCompanion(env)){
    if(action===navigationActions.practice||action===navigationActions.review)
      return startVocabularyPractice(env,id,learner,message,base);
    return dashboard(env,id,learner,message,base);
  }
  if(action===navigationActions.practice)return begin(env,id,learner,message,{base});
  if(action===navigationActions.listening)return begin(env,id,learner,message,{listening:true,ctx,base});
  if(action===navigationActions.speaking)return startSpeaking(env,telegram,id,learner,state,base);
  if(action===navigationActions.stories)return startStory(env,telegram,id,learner,state,base);
  if(action===navigationActions.progress)return progressView(env,id,learner,message,base);
  if(action===navigationActions.review)return fullReview(env,id,learner,base);
  if(action===navigationActions.skills)return privatePracticeMenu(env,telegram,id,message,base);
  if(action===navigationActions.recap)return showWeeklyRecap(env,telegram,id,learner,state,message,base);
  for (const kind of ['build','gap','dialogue','focus']) {
    if(action===navigationActions[kind])return startPrivatePractice(env,telegram,id,learner,state,kind);
  }
}

const member=(db,id)=>db.prepare(
  'SELECT l.id,l.state_json FROM telegram_accounts a JOIN learners l ON l.id=a.learner_id WHERE a.telegram_id=?'
).bind(id).first();
function stateOf(row) {
  try {const s=JSON.parse(row?.state_json||'null');
    return s?.base&&s?.target&&s.base!==s.target?s:null;
  }catch{return null;}
}
const courseOf=s=>s?.courses?.[pairKey(s.base,s.target)];
export function questionFor(s,random=Math.random,now=Date.now(),{listening=false}={}) {
  const c=courseOf(s);if(!c)return null;
  const permitted=words.filter(w=>w.level<=(c.journey?.level??1)
    &&c.vocabProgress?.[w.id]&&c.cards?.[w.id]&&w.text[s.base]&&w.text[s.target]);
  const unique=[],a=new Set(),b=new Set();
  for(const w of shuffled(permitted,random)){
    const x=searchText(w.text[s.base]),y=searchText(w.text[s.target]);
    if(a.has(x)||b.has(y))continue;
    unique.push(w);a.add(x);b.add(y);
  }
  if(unique.length<4)return null;
  const due=new Set(reviewQueue(c,false,now).map(x=>x.id));
  const eligible=unique.filter(w=>due.has(w.id));
  const entry=shuffled(eligible.length?eligible:unique,random)[0];
  const from=!listening&&random()<.5?s.base:s.target;
  const to=from===s.base?s.target:s.base;
  const options=shuffled([entry,...shuffled(unique.filter(w=>w.id!==entry.id),random).slice(0,3)],random);
  if(new Set(options.map(w=>searchText(w.text[to]))).size!==4)return null;
  return {entry:entry.id,prompt:entry.text[from],from,to,
    options:options.map(w=>w.text[to]),correct:options.findIndex(w=>w.id===entry.id)};
}

function quickQuestion(key, from, to, prompt, options, base) {
  return learningCard(chatLabel('practice',base), [
    languageDirection(from, to, base),
    { text: prompt, bold: true },
    t(base,'chooseTranslation')
  ], quickAnswerKeyboard(key,options));
}

function quickResult(env,row,selected) {
  const base=row.pair.split('>')[0];
  const options=JSON.parse(row.options_json),correct=row.correct_index;
  const navigation=continuationKeyboard(env,{base});
  const paragraphs=[
    languageDirection(row.from_language, row.to_language, base),
    { text: row.question, bold: true },
    selected===correct?t(base,'answerRight',{answer:options[correct]}):
      '✗ '+t(base,'yourAnswer',{answer:options[selected]})+'\n✓ '+t(base,'correctAnswer')+': '+options[correct]
  ];
  return learningCard(chatLabel('practice',base),paragraphs,navigation);
}

async function showListeningResult(env,id,row,selected) {
  const base=row.pair.split('>')[0];
  const correct=JSON.parse(row.options_json)[row.correct_index];
  const feedback=selected===row.correct_index?'✓ '+t(base,'correct'):'✗ '+t(base,'wrong');
  const content = messageText(chatLabel('listening',base), [
    languageDirection(row.from_language, row.to_language, base),
    feedback + '\n' + row.question + ' — ' + correct
  ]);
  const { text: caption, entities: caption_entities } = content;
  const reply_markup=listeningKeyboard(base);
  try {
    await telegram(env,'editMessageCaption',{
      chat_id:id,message_id:row.message_id,caption,caption_entities,reply_markup
    });
  } catch(error) {
    if(error.notModified)return;
    if(error.code!==400)throw error;
    await send(env,id,content,reply_markup);
  }
}

function listeningKeyboard(base) {
  return {inline_keyboard:[
    [primaryButton(navigationButton('listening', base, t(base,'listenAgain')))],
    [navigationButton('practice', base), homeButton(base)]
  ]};
}

function listeningUnavailable(env,id,base) {
  return send(env,id,messageText(chatLabel('listening',base), [
    t(base,'listenUnavailable')
  ]),listeningKeyboard(base));
}

async function listeningClip(env,ctx,question,id) {
  if(env.SPEECH_LIMITER){
    const {success}=await env.SPEECH_LIMITER.limit({key:'telegram-listen:'+id});
    if(!success)return null;
  }
  const gender=Math.random()<.5?'f':'m';
  const response=await curriculumAudio({
    id:question.entry,lang:question.from,gender,
    origin:env.PUBLIC_APP_ORIGIN
  },env,ctx);
  if(!response.ok){
    console.warn('Telegram listening audio unavailable',{status:response.status});
    return null;
  }
  return {
    audio:await response.blob(),
    transcript:resolveAudio(question.entry,question.from,gender).text
  };
}

async function sendListening(env,id,key,q,clip,base) {
  const form=new FormData();
  form.set('chat_id',id);
  form.set('audio',clip.audio,'tinglash.mp3');
  form.set('title',chatLabel('listening',base));
  form.set('performer','Aytim');
  const caption = messageText(chatLabel('listening',base), [
    languageDirection(q.from, q.to, base),
    t(base,'listenChoose')
  ]);
  form.set('caption', caption.text);
  form.set('caption_entities', JSON.stringify(caption.entities));
  form.set('reply_markup',JSON.stringify(quickAnswerKeyboard(key,q.options)));
  return telegram(env,'sendAudio',form);
}

async function begin(env,id,learner,message,{listening=false,ctx,base=stateOf(learner)?.base}={}) {
  // Bound retention without a separate scheduled cleanup Worker.
  await env.DB.prepare('DELETE FROM bot_practice_sessions WHERE id IN ('+
    'SELECT id FROM bot_practice_sessions WHERE expires_at<? LIMIT 20)')
    .bind(Date.now()-7*86400000).run();
  const s=stateOf(learner),q=s&&questionFor(s,Math.random,Date.now(),{listening});
  if(!q)return show(env,id,
    messageText(listening ? chatLabel('listening',base) : chatLabel('practice',base), [
      vocabularyCompanion(env) ? t(base,'finishLesson')
        : t(base,'tooFewWords')
    ]),
    vocabularyCompanion(env) ? appKeyboard(env,undefined,base) : dashboardKeyboard(env,true,base),message);
  const clip=listening?await listeningClip(env,ctx,q,id):null;
  if(listening&&!clip)return listeningUnavailable(env,id,base);
  const key=crypto.randomUUID().replace(/-/g,'').slice(0,20),now=Date.now();
  await env.DB.prepare(`INSERT INTO bot_practice_sessions
  (id,telegram_id,learner_id,pair,entry_id,question,from_language,to_language,
  options_json,correct_index,created_at,expires_at,kind)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
  .bind(key,id,learner.id,pairKey(s.base,s.target),q.entry,clip?.transcript??q.prompt,q.from,q.to,
    JSON.stringify(q.options),q.correct,now,now+900000,listening?'listening':'translation').run();
  const card = quickQuestion(key, q.from, q.to, q.prompt, q.options, base);
  const sendQuestion = () => deliverLearningCard(env, telegram, id, card);
  let sent;
  if(listening){
    try {
      sent=await sendListening(env,id,key,q,clip,base);
    } catch(error) {
      if(error.code!==400&&error.code!==413)throw error;
      console.warn('Telegram rejected listening audio',{code:error.code});
      await env.DB.prepare('DELETE FROM bot_practice_sessions WHERE id=? AND message_id IS NULL').bind(key).run();
      return listeningUnavailable(env,id,base);
    }
  } else if(env.TELEGRAM_PRACTICE_WIDGETS!=='1'||Date.now()<widgetUnavailableUntil){
    sent=await sendQuestion();
  } else {
    const data=practiceWidgetData({id:key,base,from:chatLanguage(q.from,base),to:chatLanguage(q.to,base),prompt:q.prompt,options:q.options});
    try {
      sent=await telegram(env,'sendWidget',{
        chat_id:id,html:practiceWidgetHtml,chat_data:data,width:320,allow_queries:true,
        protect_content:true,caption:card.text,caption_entities:card.entities,
        reply_markup:card.reply_markup
      });
    }catch(error){
      // An API rejection happens before a client receives the widget. The error
      // is captured in Worker logs; avoid a costly blocked attempt per question.
      if(![400,403,404].includes(error.code))throw error;
      if(error.widgetBlocked)widgetUnavailableUntil=Date.now()+60*60*1000;
      console.warn('Telegram rejected a practice widget',{code:error.code});
      sent=await sendQuestion();
    }
  }
  if(sent?.message_id)await env.DB.prepare('UPDATE bot_practice_sessions SET message_id=? WHERE id=?')
    .bind(sent.message_id,key).run();
}
async function attempt(env,id,messageId,key,choice,kind='translation'){
  if(!/^[a-f0-9]{20}$/.test(key)|| !/^[0-3]$/.test(choice))return {error:'invalidAnswer'};
  const now=Date.now();
  const row=await env.DB.prepare(`SELECT * FROM bot_practice_sessions
    WHERE id=? AND telegram_id=? AND message_id=? AND expires_at>? AND kind=?`)
    .bind(key,id,messageId,now,kind).first();
  if(!row)return {error:'quickExpired'};
  const accepted=await env.DB.prepare(`UPDATE bot_practice_sessions SET selected_index=?
    WHERE id=? AND telegram_id=? AND message_id=? AND expires_at>? AND selected_index IS NULL RETURNING selected_index`)
    .bind(Number(choice),key,id,messageId,now).first();
  const selected=accepted?Number(choice):(await env.DB.prepare(
    'SELECT selected_index FROM bot_practice_sessions WHERE id=?'
  ).bind(key).first())?.selected_index;
  if(selected==null)return {error:'quickExpired'};
  return {selected,correct:row.correct_index,row,fresh:Boolean(accepted)};
}
export async function botWebhook(request,env,ctx) {
  if(request.method!=='POST')return new Response('Method not allowed',{status:405});
  if(!env.TELEGRAM_BOT_TOKEN)return new Response('Unauthorized',{status:401});
  const expectedSecret=await botWebhookSecret(env);
  if(request.headers.get('X-Telegram-Bot-Api-Secret-Token')!==expectedSecret)
    return new Response('Unauthorized',{status:401});
  if(!env.DB)return new Response('Database unavailable',{status:503});
  const raw=await request.text();
  if(new TextEncoder().encode(raw).length>65536)return new Response('Too large',{status:413});
  let update;try{update=JSON.parse(raw)}catch{return new Response('Invalid JSON',{status:400})}
  if(!Number.isSafeInteger(update?.update_id)||update.update_id<0)
    return new Response('Invalid update ID',{status:400});
  return receiveTelegramUpdate(env.DB,update.update_id,()=>processUpdate(env,ctx,update));
}

async function processUpdate(env,ctx,update) {
  if(update.widget_query){
    const q=update.widget_query,from=q.from,chat=q.chat;
    if(!from||chat?.type!=='private'||String(from.id)!==String(chat.id))return new Response('OK');
    const match=/^a:([a-f0-9]{20}):([0-3])$/.exec(q.data||'');
    const r=match?await attempt(env,String(from.id),q.message_id,match[1],match[2]):{error:'invalidAnswer'};
    const base=r.row?.pair.split('>')[0] ?? chatBase(stateOf(await member(env.DB,String(from.id)))?.base,from.language_code);
    await telegram(env,'answerWidgetQuery',{widget_query_id:q.id,
      data:JSON.stringify(r.error?{error:t(base,r.error)}:{selected:r.selected,correct:r.correct})});
    if(!r.error){
      const data=practiceWidgetData({id:r.row.id,base,from:chatLanguage(r.row.from_language,base),to:chatLanguage(r.row.to_language,base),
        prompt:r.row.question,options:JSON.parse(r.row.options_json),
        selected:r.selected,correct:r.correct});
      await telegram(env,'editMessageWidgetData',{
        chat_id:chat.id,message_id:q.message_id,chat_data:data
      }).catch(()=>{});
      // Show a one-tap next action BELOW the completed widget, not inside a persistent keyboard.
      try {
        await telegram(env,'editMessageReplyMarkup',{
          chat_id:chat.id,message_id:q.message_id,reply_markup:continuationKeyboard(env,{base})
        });
      } catch {
        // On unsupported client/edit failures, give fresh attempts a navigable text fallback.
        if(r.fresh)await send(env,chat.id,
          t(base,'checkedContinue'),continuationKeyboard(env,{base}));
      }
    }
    return new Response('OK');
  }
  if(update.callback_query){
    const q=update.callback_query,chat=q.message?.chat,from=q.from;
    if(!from||chat?.type!=='private'||String(from.id)!==String(chat.id))return new Response('OK');
    // Buttons in earlier messages can still be tapped after the menu changes.
    if(vocabularyCompanion(env) && /^(?:story:|pp:)/.test(q.data ?? '')){
      await telegram(env,'answerCallbackQuery',{callback_query_id:q.id});
      await navigate(env,ctx,String(from.id),navigationActions.home,q.message,from.language_code);
      return new Response('OK');
    }
    // Keep the switch working on rich cards and widgets sent before it was removed.
    const alternative=/^alt:([a-f0-9]{20})$/.exec(q.data??'');
    if(alternative){
      const key=alternative[1], owner=String(from.id);
      const row=await env.DB.prepare(
        'SELECT * FROM bot_practice_sessions WHERE id=? AND telegram_id=? '+
        "AND message_id=? AND expires_at>? AND kind='translation'"
      ).bind(key,owner,q.message?.message_id,Date.now()).first();
      const base=row?.pair.split('>')[0] ?? chatBase(stateOf(await member(env.DB,owner))?.base,from.language_code);
      await telegram(env,'answerCallbackQuery',{
        callback_query_id:q.id,
        text:row?t(base,'plainButtons'):t(base,'quickGone')
      });
      if(row){
        const selected=row.selected_index;
        const card=selected==null?
          quickQuestion(key,row.from_language,row.to_language,row.question,JSON.parse(row.options_json),base):
          quickResult(env,row,selected);
        if(!q.message.widget){
          const sent=await deliverLearningCard(env,telegram,chat.id,card,
            {messageId:row.message_id,plain:true});
          if(sent?.message_id&&sent.message_id!==row.message_id)
            await env.DB.prepare('UPDATE bot_practice_sessions SET message_id=? WHERE id=? AND telegram_id=? AND message_id=?')
              .bind(sent.message_id,key,owner,row.message_id).run();
          return new Response('OK');
        }
        if(selected!=null){
          await send(env,chat.id,{ text: card.text, entities: card.entities },card.reply_markup);
          return new Response('OK');
        }
        const markup=card.reply_markup;
        try {
          await telegram(env,'editMessageReplyMarkup',{
            chat_id:chat.id,message_id:q.message.message_id,reply_markup:markup
          });
        } catch(error) {
          if(error.notModified)return new Response('OK');
          if(error.code!==400)throw error;
          const native=await telegram(env,'sendMessage',{
            chat_id:chat.id,
            text:card.text, entities:card.entities,
            reply_markup:markup
          });
          if(native?.message_id)await env.DB.prepare(
            'UPDATE bot_practice_sessions SET message_id=? '+
            'WHERE id=? AND telegram_id=? AND message_id=? AND selected_index IS NULL'
          ).bind(native.message_id,key,owner,q.message.message_id).run();
        }
      }
      return new Response('OK');
    }
    if(q.data?.startsWith('rem:') && await reminderCallback(env,telegram,String(from.id),q,
      chatBase(stateOf(await member(env.DB,String(from.id)))?.base,from.language_code)))return new Response('OK');
    if(await storyCallback(env,telegram,String(from.id),q))return new Response('OK');
    if(await privatePracticeCallback(env,telegram,String(from.id),q))return new Response('OK');
    if(await gradedReviewCallback(env,telegram,String(from.id),q.message,q.id,q.data,from.language_code))return new Response('OK');
    if(Object.values(navigationActions).includes(q.data)){
      await telegram(env,'answerCallbackQuery',{callback_query_id:q.id});
      await navigate(env,ctx,String(from.id),q.data,q.message,from.language_code);
      return new Response('OK');
    }
    const match=/^a:([a-f0-9]{20}):([0-3])$/.exec(q.data||'');
    const kind=q.message.audio?'listening':'translation';
    if(kind==='listening'&&vocabularyCompanion(env)){
      await telegram(env,'answerCallbackQuery',{callback_query_id:q.id});
      await navigate(env,ctx,String(from.id),navigationActions.home,q.message,from.language_code);
      return new Response('OK');
    }
    const r=match?await attempt(env,String(from.id),q.message.message_id,match[1],match[2],kind):{error:'invalidAnswer'};
    const base=r.row?.pair.split('>')[0] ?? chatBase(stateOf(await member(env.DB,String(from.id)))?.base,from.language_code);
    await telegram(env,'answerCallbackQuery',{callback_query_id:q.id,
      ...(r.error ? { text: t(base,r.error) } : {})});
    if(!r.error){
      if(kind==='listening'){
        await showListeningResult(env,chat.id,r.row,r.selected);
        return new Response('OK');
      }
      const card=quickResult(env,r.row,r.selected);
      if(q.message.widget){
        if(!r.fresh)return new Response('OK');
        // A widget media message cannot be replaced with edited text. The
        // fallback button's answer still updates its server-side session.
        const data=practiceWidgetData({id:r.row.id,base,from:chatLanguage(r.row.from_language,base),
          to:chatLanguage(r.row.to_language,base),prompt:r.row.question,
          options:JSON.parse(r.row.options_json),selected:r.selected,correct:r.correct});
        await telegram(env,'editMessageWidgetData',{
          chat_id:chat.id,message_id:q.message.message_id,chat_data:data
        }).catch(()=>{});
        await telegram(env,'editMessageReplyMarkup',{
          chat_id:chat.id,message_id:q.message.message_id,
          reply_markup:continuationKeyboard(env,{base})
        }).catch(()=>{});
        await send(env,chat.id,{ text: card.text, entities: card.entities },card.reply_markup);
      } else {
        const result=await deliverLearningCard(env,telegram,chat.id,card,{
          messageId:q.message.message_id,plain:!q.message.rich_message
        });
        if(result?.message_id&&result.message_id!==r.row.message_id)
          await env.DB.prepare('UPDATE bot_practice_sessions SET message_id=? WHERE id=? AND telegram_id=? AND message_id=?')
            .bind(result.message_id,r.row.id,String(from.id),r.row.message_id).run();
      }
    }
    return new Response('OK');
  }
  const m=update.message;
  if(!m?.from||m.from.is_bot||m.chat?.type!=='private'||
    String(m.from.id)!==String(m.chat.id))return new Response('OK');
  const id=String(m.from.id);
  if(m.voice){
    if(!vocabularyCompanion(env)&&!m.forward_origin)await checkSpeaking(env,telegram,id,m,chatBase(stateOf(await member(env.DB,id))?.base,m.from.language_code));
    return new Response('OK');
  }
  if(!m.text)return new Response('OK');
  const learner=await member(env.DB,id);
  const state=stateOf(learner);
  const base=chatBase(state?.base,m.from.language_code);
  const rawText=m.text.trim().toLowerCase();
  const command=rawText.split(/\s+/)[0].split('@')[0];
  if(!learner || ['/start','/help','/menu'].includes(command) ||
      ['menu','bosh menyu','asosiy menyu'].includes(rawText)){
    await dashboard(env,id,learner,undefined,base);return new Response('OK');
  }
  if(command==='/reminders'||rawText==='eslatmalar'){
    await reminderSettings(env,telegram,id,undefined,base);
    return new Response('OK');
  }
  if(command==='/remindzone'){
    await setReminderZone(env,telegram,id,m.text.trim().split(/\s+/).slice(1,3).join(' ').toLowerCase(),base);
    return new Response('OK');
  }
  const quickPractice=['/practice','mashq','mashqlar'].includes(command)||['tezkor mashq','tezkor mashqlar'].includes(rawText);
  const review=['/review','lug‘at','lugʻat',"lug'at",'takrorlash'].includes(command);
  if(vocabularyCompanion(env)){
    if(quickPractice||review)await startVocabularyPractice(env,id,learner,undefined,base);
    else await dashboard(env,id,learner,undefined,base);
    return new Response('OK');
  }
  if(quickPractice)
    await begin(env,id,learner,undefined,{base});
  else if(command==='/listen'||rawText==='tinglash')
    await begin(env,id,learner,undefined,{listening:true,ctx,base});
  else if(command==='/speak'||rawText==='gapirish')
    await startSpeaking(env,telegram,id,learner,state,base);
  else if(command==='/stories'||rawText==='qisqa hikoyalar')
    await startStory(env,telegram,id,learner,state,base);
  else if(command==='/skills'||rawText==='til mashqlari')
    await privatePracticeMenu(env,telegram,id,undefined,base);
  else if(command==='/dialogue'||rawText==='suhbat')
    await startPrivatePractice(env,telegram,id,learner,state,'dialogue');
  else if(command==='/recap'||rawText==='haftalik hisobot')
    await showWeeklyRecap(env,telegram,id,learner,state,undefined,base);
  else if(review)
    await fullReview(env,id,learner,base);
  else if(command==='/progress'||['natijalar','rivojlanish'].includes(rawText))
    await progressView(env,id,learner,undefined,base);
  else if(command==='/lesson'||rawText==='darslar')
    await send(env,id,messageText(t(base,'lessons')),appKeyboard(env,'lesson',base,'📖 ' + chatLabel('lesson',base)));
  else await dashboard(env,id,learner,undefined,base);
  return new Response('OK');
}
