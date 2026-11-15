// Telegram Bot API 10.4 embeds this tiny HTML document in a constrained
// QuickJS/DOM environment. Use createElement/appendChild, not browser-only
// selectors, classes, inline event attributes or network APIs.
export const practiceWidgetHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root {
  color-scheme: light;
  --paper:#fffefa; --ink:#203e36; --muted:#5b7265; --edge:#dce3d7;
  --accent:#0f6d60; --surface:#f3f5ee; --hover:#e6efe4;
  --correct-soft:#edf5e9; --correct-ink:#265746;
  --wrong-soft:#fcece8; --wrong-ink:#793e38; --wrong-border:#cf9d97;
}
@media (prefers-color-scheme:dark) {
  :root {
    color-scheme:dark;
    --paper:#16302a; --ink:#e6efe9; --muted:#9db3a7; --edge:#2b4c43;
    --accent:#6fcfb6; --surface:#193630; --hover:#1d3d35;
    --correct-soft:#1e4232; --correct-ink:#a8e0c2;
    --wrong-soft:#45231f; --wrong-ink:#f0b8b0; --wrong-border:#8a4a42;
  }
}
* { box-sizing:border-box }
body {
  margin:0; padding:14px 14px calc(12px + env(safe-area-inset-bottom));
  background:var(--paper); color:var(--ink);
  font: var(--tg-text-font-size, 16px)/1.4 system-ui,sans-serif;
}
h1 { font-size:17px; font-weight:700; margin:0 }
small { display:block; color:var(--muted); font-size:13px; margin-top:2px }
.prompt { font-size:24px; font-weight:700; overflow-wrap:anywhere; margin:12px 0 }
.instruction { color:var(--muted); margin:0 0 9px }
section { display:grid; gap:6px }
button {
  border:1px solid var(--edge); background:var(--surface); color:var(--ink);
  border-radius:10px; padding:8px 10px; min-height:44px;
  font:600 14px system-ui,sans-serif; overflow-wrap:anywhere;
}
button:hover:not(:disabled) { background:var(--hover) }
button:focus-visible { outline:2px solid var(--accent); outline-offset:2px }
button.correct { background:var(--correct-soft); color:var(--correct-ink) }
button.wrong { background:var(--wrong-soft); color:var(--wrong-ink); border-color:var(--wrong-border) }
footer { margin-top:9px; font-size:13px; overflow-wrap:anywhere }
footer:empty { display:none }
</style></head><body><script>
(function(){
 const tg=window.TelegramWidget;
 const heading=document.createElement('h1'),small=document.createElement('small');
 const prompt=document.createElement('p');
 const instruction=document.createElement('p'),area=document.createElement('section');
 const result=document.createElement('footer');
 heading.textContent='Tezkor mashq';
 prompt.classList.add('prompt');prompt.dir='auto';
 instruction.classList.add('instruction');
 document.body.appendChild(heading);document.body.appendChild(small);document.body.appendChild(prompt);
 document.body.appendChild(instruction);document.body.appendChild(area);
 document.body.appendChild(result);
 let data={},busy=false,error='';
 function load(){try{data=JSON.parse(tg&&tg.chatData||'{}')}catch(e){data={}}}
 function draw(){
   prompt.textContent=data.p||'';
   small.textContent=(data.from||'')+' → '+(data.to||'');
   instruction.textContent=Number.isInteger(data.selected)?'':'To‘g‘ri tarjimani tanlang.';
   instruction.hidden=Number.isInteger(data.selected);
   area.textContent='';
   (data.options||[]).forEach(function(label,i){
     const b=document.createElement('button');
     const correct=Number.isInteger(data.correct)&&data.correct===i;
     const wrong=data.selected===i&&!correct;
     b.textContent=(correct?'✓ ':wrong?'✗ ':'')+label;
     b.dir='auto';
     if(correct)b.classList.add('correct');
     if(wrong)b.classList.add('wrong');
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
     :busy?'Tekshirilmoqda…':'');
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
