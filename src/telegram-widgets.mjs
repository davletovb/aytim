// Small static Telegram Bot API 10.4 widget. No credentials, answer keys, network or
// external assets enter the sandbox. All displayed data is supplied via chat_data.
export const practiceWidgetHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}body{margin:0;padding:12px 10px 6px;color:var(--tg-theme-text-color,#172823);font:16px system-ui,sans-serif}
small{display:block;color:var(--tg-theme-hint-color,#6b7973);font-size:12px;font-weight:600;margin-bottom:6px}
#prompt{font-size:23px;font-weight:750;line-height:1.35;overflow-wrap:anywhere;min-height:40px}
#instruction{margin:6px 0 10px;font-size:13px;color:var(--tg-theme-hint-color,#65756e)}
#options{display:grid;grid-template-columns:1fr 1fr;gap:7px}
button{appearance:none;border:1px solid var(--tg-theme-hint-color,#9ea9a2);background:var(--tg-theme-secondary-bg-color,#f2f6f3);color:inherit;border-radius:11px;padding:11px 7px;min-height:46px;font:600 14px system-ui,sans-serif;overflow-wrap:anywhere}
button:disabled{opacity:.65}button.chosen{border:2px solid var(--tg-theme-button-color,#147c58)}
button.correct{background:#d7f2df;color:#154b2a;border-color:#219568}
#result{margin-top:10px;min-height:20px;font-size:13px;font-weight:600}
</style></head><body><small>AYTIM · TEZKOR MASHQ</small><div id="prompt"></div>
<div id="instruction"></div><div id="options"></div><div id="result" aria-live="polite"></div>
<script>
(function(){
 const tg=window.TelegramWidget;
 let data={};let busy=false;let error='';
 function load(){try{data=JSON.parse(tg&&tg.chatData||'{}')}catch(e){data={}}}
 function draw(){
   const prompt=document.getElementById('prompt'),instruction=document.getElementById('instruction');
   const area=document.getElementById('options'),result=document.getElementById('result');
   prompt.textContent=data.p||'Aytim';instruction.textContent=(data.from||'')+' → '+(data.to||'')+' · To‘g‘ri tarjimani tanlang';
   area.textContent='';
   (data.options||[]).forEach(function(label,i){
     const b=document.createElement('button');b.textContent=label;
     if(data.selected===i)b.className='chosen';
     if(Number.isInteger(data.correct)&&data.correct===i)b.className='correct';
     b.disabled=Number.isInteger(data.selected)||busy;
     b.addEventListener('click',function(){
       if(!tg||busy||Number.isInteger(data.selected))return;
       busy=true;error='';draw();
       // A synchronous request in the tap handler is required by Telegram.
       tg.request('a:'+data.id+':'+i).then(function(reply){
         busy=false;
         try{const response=JSON.parse(reply.result||'{}');if(Number.isInteger(response.selected)) {
           data.selected=response.selected;data.correct=response.correct;
         } else error='Javobni tekshirib bo‘lmadi.';}catch(e){error='Javobni tekshirib bo‘lmadi.';}
         draw();
       },function(){busy=false;error='Aloqa uzildi. Qayta urinib ko‘ring.';draw()});
     });area.appendChild(b);
   });
   result.textContent=error||(Number.isInteger(data.selected)
     ?(data.selected===data.correct?'✓ To‘g‘ri!':'To‘g‘ri javob: '+(data.options[data.correct]||''))+
        ''
     :busy?'Tekshirilmoqda…':'Javobni tanlang');
 }
 load();draw();
 if(tg){tg.onEvent('chatDataChanged',function(){load();draw()});tg.ready()}
})();
</script></body></html>`;

export function practiceWidgetData({ id, from, to, prompt, options, selected = null, correct = null }) {
  const data = { id, from, to, p: prompt, options, selected, correct };
  const json = JSON.stringify(data);
  if (new TextEncoder().encode(json).length > 1024) throw new RangeError('Widget chat_data is too large');
  return json;
}
