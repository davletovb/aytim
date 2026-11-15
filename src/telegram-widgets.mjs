// Telegram Bot API 10.4 embeds this tiny HTML document in a constrained
// QuickJS/DOM environment. Use createElement/appendChild, not browser-only
// selectors, classes, inline event attributes or network APIs.
export const practiceWidgetHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}body{margin:0;padding:12px 10px 6px;color:var(--tg-theme-text-color,#172823);font:16px system-ui,sans-serif}
small{display:block;color:var(--tg-theme-hint-color,#6b7973);font-size:12px;font-weight:600;margin-bottom:6px}
h1{font-size:23px;font-weight:750;line-height:1.35;overflow-wrap:anywhere;min-height:40px;margin:0}
p{margin:6px 0 10px;font-size:13px;color:var(--tg-theme-hint-color,#65756e)}
section{display:grid;grid-template-columns:1fr 1fr;gap:7px}
button{appearance:none;border:1px solid var(--tg-theme-hint-color,#9ea9a2);background:var(--tg-theme-secondary-bg-color,#f2f6f3);color:inherit;border-radius:11px;padding:11px 7px;min-height:46px;font:600 14px system-ui,sans-serif;overflow-wrap:anywhere}
button:disabled{opacity:.65}footer{margin-top:10px;min-height:20px;font-size:13px;font-weight:600}
</style></head><body><script>
(function(){
 const tg=window.TelegramWidget;
 const small=document.createElement('small'),prompt=document.createElement('h1');
 const instruction=document.createElement('p'),area=document.createElement('section');
 const result=document.createElement('footer');
 small.textContent='AYTIM · TEZKOR MASHQ';
 document.body.appendChild(small);document.body.appendChild(prompt);
 document.body.appendChild(instruction);document.body.appendChild(area);
 document.body.appendChild(result);
 let data={},busy=false,error='';
 function load(){try{data=JSON.parse(tg&&tg.chatData||'{}')}catch(e){data={}}}
 function draw(){
   prompt.textContent=data.p||'Aytim';
   instruction.textContent=(data.from||'')+' → '+(data.to||'')+' · To‘g‘ri tarjimani tanlang';
   area.textContent='';
   (data.options||[]).forEach(function(label,i){
     const b=document.createElement('button');
     b.textContent=(Number.isInteger(data.correct)&&data.correct===i?'✓ ':'')+label;
     b.disabled=Number.isInteger(data.selected)||busy;
     b.addEventListener('click',function(){
       if(!tg||busy||Number.isInteger(data.selected))return;
       // Telegram requires request() synchronously in the original tap event.
       // Submit first; only then repaint the options into a busy state.
       let pending;
       try{pending=tg.request('a:'+data.id+':'+i)}
       catch(e){error='Javobni tekshirib bo‘lmadi.';draw();return}
       busy=true;error='';draw();
       pending.then(function(reply){
         busy=false;
         try{
           const response=JSON.parse(reply.result||'{}');
           if(Number.isInteger(response.selected)){
             data.selected=response.selected;data.correct=response.correct;
           }else error='Javobni tekshirib bo‘lmadi.';
         }catch(e){error='Javobni tekshirib bo‘lmadi.'}
         draw();
       },function(){busy=false;error='Aloqa uzildi. Qayta urinib ko‘ring.';draw()});
     });area.appendChild(b);
   });
   result.textContent=error||(Number.isInteger(data.selected)
     ?(data.selected===data.correct?'✓ To‘g‘ri!':'To‘g‘ri javob: '+(data.options[data.correct]||''))
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
