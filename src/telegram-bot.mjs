import { words } from '../dist/words.mjs';
import { reviewQueue, pairKey, searchText, shuffled } from '../dist/engine.mjs';
import { practiceWidgetHtml, practiceWidgetData } from './telegram-widgets.mjs';

// A standalone practice question is diagnostic, never four-check vocabulary review.
const appButton = env => ({inline_keyboard:[[{
  text:'Aytim ilovasini ochish', web_app:{url:env.PUBLIC_APP_ORIGIN}
}]]});
async function telegram(env, method, payload) {
  const response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),
    signal:AbortSignal.timeout(8000)
  });
  const value=await response.json().catch(()=>null);
  if(!response.ok||!value?.ok)throw new Error('Telegram '+method+': '+(value?.description||response.status));
  return value.result;
}
const send=(env,id,text)=>telegram(env,'sendMessage',{
  chat_id:id,text,reply_markup:appButton(env)
});
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
async function begin(env,id,learner) {
  const s=stateOf(learner),q=s&&questionFor(s);
  if(!q)return send(env,id,'Chat mashqi uchun hali yetarli o‘rganilgan so‘z yo‘q. Aytim ilovasida darsni davom ettiring.');
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
      protect_content:true,caption:'Aytim · Qisqa mashq (bahoga qo‘shilmaydi)'
    });
  }catch{
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
  if(!env.TELEGRAM_WEBHOOK_SECRET||!env.TELEGRAM_BOT_TOKEN||
    request.headers.get('X-Telegram-Bot-Api-Secret-Token')!==env.TELEGRAM_WEBHOOK_SECRET)
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
    }
    return new Response('OK');
  }
  if(update.callback_query){
    const q=update.callback_query,chat=q.message?.chat,from=q.from;
    if(!from||chat?.type!=='private'||String(from.id)!==String(chat.id))return new Response('OK');
    const match=/^a:([a-f0-9]{20}):([0-3])$/.exec(q.data||'');
    const r=match?await attempt(env,String(from.id),q.message?.message_id,match[1],match[2]):{error:'Invalid answer'};
    await telegram(env,'answerCallbackQuery',{callback_query_id:q.id,
      text:r.error||('Javob qabul qilindi.'),show_alert:false});
    if(!r.error&&r.fresh){
      await telegram(env,'editMessageReplyMarkup',{
        chat_id:chat.id,message_id:q.message.message_id,reply_markup:{inline_keyboard:[]}
      }).catch(()=>{});
      await send(env,chat.id,(r.selected===r.correct?'✓ To‘g‘ri!':
        'To‘g‘ri javob: '+JSON.parse(r.row.options_json)[r.correct])+
        '\nBu mashq Lug‘at bahosiga qo‘shilmaydi.\nYana mashq: /practice');
    }
    return new Response('OK');
  }
  const m=update.message;
  if(!m?.from||m.from.is_bot||m.chat?.type!=='private'||
    String(m.from.id)!==String(m.chat.id)||!m.text)return new Response('OK');
  const id=String(m.from.id),learner=await member(env.DB,id);
  if(!learner){
    await send(env,id,'Aytimga xush kelibsiz! 🌱 Ilovada Telegram orqali kiring va darslarni boshlang.');
    return new Response('OK');
  }
  const command=m.text.trim().toLowerCase().split(/\s+/)[0].split('@')[0];
  if(['/practice','/review','mashq','lug‘at'].includes(command))await begin(env,id,learner);
  else if(command==='/progress'){
    const s=stateOf(learner),c=s&&courseOf(s);
    await send(env,id,s?'Yo‘nalish: '+s.base.toUpperCase()+' → '+s.target.toUpperCase()+
      '\nDaraja: '+(c?.journey?.level??1)+'/8'+
      '\nTakrorlashga tayyor: '+(c?reviewQueue(c).length:0)+'\n/practice — mashq':
      'Aytim ilovasida avval til yo‘nalishini tanlang.');
  }else await send(env,id,'Aytim 🌱\n/practice — qisqa so‘z mashqi\n/progress — rivojlanish\n\nTo‘liq Lug‘at takrorlash va darslar ilovada. Chat mashqlari hozircha bahoga qo‘shilmaydi.');
  return new Response('OK');
}
