import { words } from '../dist/words.mjs';
import { reviewQueue, pairKey, searchText, shuffled } from '../dist/engine.mjs';
import { practiceWidgetHtml, practiceWidgetData } from './telegram-widgets.mjs';
import { appKeyboard, dashboardKeyboard, continuationKeyboard, progressKeyboard, navigationActions } from './telegram-navigation.mjs';
import { botWebhookSecret } from './telegram-bootstrap.mjs';
import { startGradedReview, gradedReviewCallback } from './telegram-review.mjs';
import { TelegramApiError, deliverLearningCard, learningCard } from './telegram-rich.mjs';
import { receiveTelegramUpdate } from './telegram-receipts.mjs';

// A standalone practice question is diagnostic, never four-check vocabulary review.
// Telegram currently rejects sendWidget for some bots; avoid retrying an API
// operation known to be blocked on every question (retry after one hour).
let widgetUnavailableUntil = 0;

export function quickAnswerKeyboard(id, options) {
  return {inline_keyboard: options.map((value,i)=>[{
    text:value.slice(0,60),callback_data:'a:'+id+':'+i
  }])};
}
const quickAlternative = id => ({text:'🔢 Oddiy tugmalar',callback_data:'alt:'+id});
async function telegram(env, method, payload) {
  const response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),
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
const send=(env,id,text,reply_markup=appKeyboard(env))=>telegram(env,'sendMessage',{
  chat_id:id,text,...(reply_markup?{reply_markup}:{})
});
// Reuse a text dashboard message when a navigation callback can edit it.
// Widgets cannot be replaced using editMessageText; send a new menu there.
async function show(env,id,text,keyboard,message){
  if(message?.text && message?.message_id){
    try{return await telegram(env,'editMessageText',{
      chat_id:id,message_id:message.message_id,text,...(keyboard?{reply_markup:keyboard}:{})
    });}catch(error){
      // Telegram rejects a no-op edit; don't replace it with another bubble.
      if(error.notModified)return null;
      if(error.code!==400)throw error;
    }
  }
  return send(env,id,text,keyboard);
}
function dashboardText(learner) {
  return learner
    ? 'Aytim 🌱\n\nBugun nimani o‘rganamiz? Quyidagi tugmalardan birini tanlang.'
    : 'Aytimga xush kelibsiz! 🌱\n\nDarslarni boshlash uchun Aytim ilovasini oching va Telegram orqali kiring.';
}
function dashboard(env,id,learner,message){
  return show(env,id,dashboardText(learner),dashboardKeyboard(env,Boolean(learner)),message);
}
function progressText(learner){
  const s=stateOf(learner),c=s&&courseOf(s);
  return s ? '📊 Sizning natijalaringiz\n\nYo‘nalish: '+s.base.toUpperCase()+' → '+s.target.toUpperCase()+
    '\nDaraja: '+(c?.journey?.level??1)+'/8'+
    '\nTakrorlashga tayyor: '+(c?reviewQueue(c).length:0)+
    '\n\nBatafsil natijalar Aytim ilovasida.'
    : 'Aytim ilovasida avval til yo‘nalishini tanlang.';
}
function progressView(env,id,learner,message){
  return show(env,id,progressText(learner),progressKeyboard(env),message);
}
function fullReview(env,id,learner){
  return startGradedReview(env,telegram,id,learner);
}
async function navigate(env,id,action,message){
  const learner=await member(env.DB,id);
  if(action===navigationActions.home)return dashboard(env,id,learner,message);
  if(!learner)return dashboard(env,id,null,message);
  if(action===navigationActions.practice)return begin(env,id,learner,message);
  if(action===navigationActions.progress)return progressView(env,id,learner,message);
  if(action===navigationActions.review)return fullReview(env,id,learner);
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
export function questionFor(s,random=Math.random,now=Date.now()) {
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
  const from=random()<.5?s.base:s.target,to=from===s.base?s.target:s.base;
  const options=shuffled([entry,...shuffled(unique.filter(w=>w.id!==entry.id),random).slice(0,3)],random);
  if(new Set(options.map(w=>searchText(w.text[to]))).size!==4)return null;
  return {entry:entry.id,prompt:entry.text[from],from,to,
    options:options.map(w=>w.text[to]),correct:options.findIndex(w=>w.id===entry.id)};
}

function quickQuestion(key, from, to, prompt, options) {
  return learningCard('🎯 Tezkor mashq', [
    from.toUpperCase()+' → '+to.toUpperCase(),
    'To‘g‘ri tarjimani tanlang:',
    prompt
  ], quickAnswerKeyboard(key,options));
}

function quickResult(env,row,selected) {
  const options=JSON.parse(row.options_json),correct=row.correct_index;
  const answers=[{
    text:'✓ '+options[correct].slice(0,60),style:'success',disabled:{}
  }];
  if(selected!==correct)
    answers.unshift({text:'✗ '+options[selected].slice(0,60),style:'danger',disabled:{}});
  const navigation=continuationKeyboard(env);
  const paragraphs=[
    row.from_language.toUpperCase()+' → '+row.to_language.toUpperCase(),
    row.question,
    selected===correct?'✓ To‘g‘ri!':'✗ To‘g‘ri javob: '+options[correct]
  ];
  const card=learningCard('🎯 Tezkor mashq',paragraphs,navigation);
  // Older clients can read the result and use the ordinary navigation keyboard.
  card.blocks.push({type:'buttons',buttons:answers});
  return card;
}

async function begin(env,id,learner,message) {
  // Bound retention without a separate scheduled cleanup Worker.
  await env.DB.prepare('DELETE FROM bot_practice_sessions WHERE id IN ('+
    'SELECT id FROM bot_practice_sessions WHERE expires_at<? LIMIT 20)')
    .bind(Date.now()-7*86400000).run();
  const s=stateOf(learner),q=s&&questionFor(s);
  if(!q)return show(env,id,
    'Hali yetarli tanish so‘z yo‘q. Yangi darsni tugating yoki Lug‘at takrorlashni sinang.',
    dashboardKeyboard(env,true),message);
  const key=crypto.randomUUID().replace(/-/g,'').slice(0,20),now=Date.now();
  await env.DB.prepare(`INSERT INTO bot_practice_sessions
  (id,telegram_id,learner_id,pair,entry_id,question,from_language,to_language,
  options_json,correct_index,created_at,expires_at)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
  .bind(key,id,learner.id,pairKey(s.base,s.target),q.entry,q.prompt,q.from,q.to,
    JSON.stringify(q.options),q.correct,now,now+900000).run();
  const alternative=quickAlternative(key);
  const sendQuestion=()=>deliverLearningCard(env,telegram,id,
    quickQuestion(key,q.from,q.to,q.prompt,q.options),{alternative});
  let sent;
  if(env.TELEGRAM_PRACTICE_WIDGETS!=='1'||Date.now()<widgetUnavailableUntil){
    sent=await sendQuestion();
  } else {
    const data=practiceWidgetData({id:key,from:q.from,to:q.to,prompt:q.prompt,options:q.options});
    try {
      sent=await telegram(env,'sendWidget',{
        chat_id:id,html:practiceWidgetHtml,chat_data:data,width:320,allow_queries:true,
        protect_content:true,caption:'Aytim · Tezkor mashq',
        reply_markup:{inline_keyboard:[[alternative]]}
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
async function attempt(env,id,messageId,key,choice){
  if(!/^[a-f0-9]{20}$/.test(key)|| !/^[0-3]$/.test(choice))return {error:'Invalid answer'};
  const row=await env.DB.prepare(`SELECT * FROM bot_practice_sessions
    WHERE id=? AND telegram_id=? AND message_id=? AND expires_at>?`)
    .bind(key,id,messageId,Date.now()).first();
  if(!row)return {error:'Mashq muddati tugagan. /practice bilan yangisini boshlang.'};
  const accepted=await env.DB.prepare(`UPDATE bot_practice_sessions SET selected_index=?
    WHERE id=? AND telegram_id=? AND selected_index IS NULL RETURNING selected_index`)
    .bind(Number(choice),key,id).first();
  const selected=accepted?Number(choice):(await env.DB.prepare(
    'SELECT selected_index FROM bot_practice_sessions WHERE id=?'
  ).bind(key).first())?.selected_index;
  return {selected,correct:row.correct_index,row,fresh:Boolean(accepted)};
}
export async function botWebhook(request,env) {
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
  return receiveTelegramUpdate(env.DB,update.update_id,()=>processUpdate(env,update));
}

async function processUpdate(env,update) {
  if(update.widget_query){
    const q=update.widget_query,from=q.from,chat=q.chat;
    if(!from||chat?.type!=='private'||String(from.id)!==String(chat.id))return new Response('OK');
    const match=/^a:([a-f0-9]{20}):([0-3])$/.exec(q.data||'');
    const r=match?await attempt(env,String(from.id),q.message_id,match[1],match[2]):{error:'Invalid answer'};
    await telegram(env,'answerWidgetQuery',{widget_query_id:q.id,
      data:JSON.stringify(r.error?{error:r.error}:{selected:r.selected,correct:r.correct})});
    if(!r.error){
      const data=practiceWidgetData({id:r.row.id,from:r.row.from_language,to:r.row.to_language,
        prompt:r.row.question,options:JSON.parse(r.row.options_json),
        selected:r.selected,correct:r.correct});
      await telegram(env,'editMessageWidgetData',{
        chat_id:chat.id,message_id:q.message_id,chat_data:data
      }).catch(()=>{});
      // Show a one-tap next action BELOW the completed widget, not inside a persistent keyboard.
      try {
        await telegram(env,'editMessageReplyMarkup',{
          chat_id:chat.id,message_id:q.message_id,reply_markup:continuationKeyboard(env)
        });
      } catch {
        // On unsupported client/edit failures, give fresh attempts a navigable text fallback.
        if(r.fresh)await send(env,chat.id,
          'Javob tekshirildi. Davom eting:',continuationKeyboard(env));
      }
    }
    return new Response('OK');
  }
  if(update.callback_query){
    const q=update.callback_query,chat=q.message?.chat,from=q.from;
    if(!from||chat?.type!=='private'||String(from.id)!==String(chat.id))return new Response('OK');
    // Rich cards and older widget messages share the same plain-button route.
    const alternative=/^alt:([a-f0-9]{20})$/.exec(q.data??'');
    if(alternative){
      const key=alternative[1], owner=String(from.id);
      const row=await env.DB.prepare(
        'SELECT * FROM bot_practice_sessions WHERE id=? AND telegram_id=? '+
        'AND message_id=? AND expires_at>?'
      ).bind(key,owner,q.message?.message_id,Date.now()).first();
      await telegram(env,'answerCallbackQuery',{
        callback_query_id:q.id,
        text:row?'Oddiy tugmalar ochildi.':'Bu mashq tugagan yoki eskirgan.'
      });
      if(row){
        const selected=row.selected_index;
        const card=selected==null?
          quickQuestion(key,row.from_language,row.to_language,row.question,JSON.parse(row.options_json)):
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
          await send(env,chat.id,card.text,card.reply_markup);
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
            text:row.from_language+' → '+row.to_language+'\n'+row.question+
              '\nTo‘g‘ri tarjimani tanlang:',
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
    if(await gradedReviewCallback(env,telegram,String(from.id),q.message,q.id,q.data))return new Response('OK');
    if(Object.values(navigationActions).includes(q.data)){
      await telegram(env,'answerCallbackQuery',{callback_query_id:q.id});
      await navigate(env,String(from.id),q.data,q.message);
      return new Response('OK');
    }
    const match=/^a:([a-f0-9]{20}):([0-3])$/.exec(q.data||'');
    const r=match?await attempt(env,String(from.id),q.message?.message_id,match[1],match[2]):{error:'Invalid answer'};
    await telegram(env,'answerCallbackQuery',{callback_query_id:q.id,
      text:r.error||'Javob qabul qilindi.',show_alert:false});
    if(!r.error){
      const card=quickResult(env,r.row,r.selected);
      if(q.message?.widget){
        if(!r.fresh)return new Response('OK');
        // A widget media message cannot be replaced with edited text. The
        // fallback button's answer still updates its server-side session.
        const data=practiceWidgetData({id:r.row.id,from:r.row.from_language,
          to:r.row.to_language,prompt:r.row.question,
          options:JSON.parse(r.row.options_json),selected:r.selected,correct:r.correct});
        await telegram(env,'editMessageWidgetData',{
          chat_id:chat.id,message_id:q.message.message_id,chat_data:data
        }).catch(()=>{});
        await telegram(env,'editMessageReplyMarkup',{
          chat_id:chat.id,message_id:q.message.message_id,
          reply_markup:continuationKeyboard(env)
        }).catch(()=>{});
        await send(env,chat.id,card.text,card.reply_markup);
      } else {
        const result=await deliverLearningCard(env,telegram,chat.id,card,{
          messageId:q.message.message_id,plain:!q.message.rich_message,
          alternative:quickAlternative(r.row.id)
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
    String(m.from.id)!==String(m.chat.id)||!m.text)return new Response('OK');
  const id=String(m.from.id),learner=await member(env.DB,id);
  const rawText=m.text.trim().toLowerCase();
  const command=rawText.split(/\s+/)[0].split('@')[0];
  if(!learner || ['/start','/help','/menu'].includes(command) ||
      ['menu','bosh menyu','asosiy menyu'].includes(rawText)){
    await dashboard(env,id,learner);return new Response('OK');
  }
  if(['/practice','mashq'].includes(command)||rawText==='tezkor mashq')
    await begin(env,id,learner);
  else if(['/review','lug‘at','takrorlash'].includes(command))
    await fullReview(env,id,learner);
  else if(command==='/progress'||['natijalar','rivojlanish'].includes(rawText))
    await progressView(env,id,learner);
  else if(command==='/lesson'||rawText==='darslar')
    await send(env,id,'📖 Darslar Aytim ilovasida. Darsni davom ettirish uchun ilovani oching.');
  else await dashboard(env,id,learner);
  return new Response('OK');
}
