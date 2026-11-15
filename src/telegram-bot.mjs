import { words } from '../dist/words.mjs';
import { reviewQueue, pairKey, searchText, shuffled } from '../dist/engine.mjs';
import { practiceWidgetHtml, practiceWidgetData } from './telegram-widgets.mjs';
import { appKeyboard, dashboardKeyboard, continuationKeyboard, progressKeyboard, navigationActions } from './telegram-navigation.mjs';
import { botWebhookSecret } from './telegram-bootstrap.mjs';
import { startGradedReview, gradedReviewCallback } from './telegram-review.mjs';

// A standalone practice question is diagnostic, never four-check vocabulary review.
async function telegram(env, method, payload) {
  const response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),
    signal:AbortSignal.timeout(8000)
  });
  const value=await response.json().catch(()=>null);
  if(!response.ok||!value?.ok)throw new Error('Telegram '+method+': '+(value?.description||response.status));
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
      if(/not modified/i.test(error.message))return null;
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
  const data=practiceWidgetData({id:key,from:q.from,to:q.to,prompt:q.prompt,options:q.options});
  let sent;
  try {
    sent=await telegram(env,'sendWidget',{
      chat_id:id,html:practiceWidgetHtml,chat_data:data,width:320,allow_queries:true,
      protect_content:true,caption:'Aytim · Tezkor mashq'
    });
  }catch(error){
    // This is a Telegram API failure, NOT evidence that the user's client
    // lacks widget support. Preserve the precise safe error for Worker logs.
    console.warn('Telegram widget send failed; using inline keyboard:',String(error.message).slice(0,220));
    sent=await telegram(env,'sendMessage',{
      chat_id:id,text:q.from+' → '+q.to+'\n'+q.prompt+'\nTo‘g‘ri tarjimani tanlang:',
      reply_markup:{inline_keyboard:q.options.map((value,i)=>[{
        text:value.slice(0,60),callback_data:'a:'+key+':'+i
      }])}
    });
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
    if(!r.error&&r.fresh){
      const correct=JSON.parse(r.row.options_json)[r.correct];
      // Edit the existing question instead of adding another chat bubble.
      const resultText=r.row.from_language+' → '+r.row.to_language+'\n'+r.row.question+
        '\n\n'+(r.selected===r.correct?'✓ To‘g‘ri!':'To‘g‘ri javob: '+correct);
      try {
        await telegram(env,'editMessageText',{
          chat_id:chat.id,message_id:q.message.message_id,
          text:resultText,reply_markup:continuationKeyboard(env)
        });
      } catch {
        await send(env,chat.id,resultText,continuationKeyboard(env));
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
