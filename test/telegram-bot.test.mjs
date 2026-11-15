import test from 'node:test';
import assert from 'node:assert/strict';
import { codes } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { newCourse } from '../dist/engine.mjs';
import { questionFor, botWebhook } from '../src/telegram-bot.mjs';
import { practiceWidgetHtml, practiceWidgetData } from '../src/telegram-widgets.mjs';
import { deflateSync } from 'node:zlib';

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
