import test from 'node:test';
import assert from 'node:assert/strict';
import { codes } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { newCourse, seededRandom, saveReview } from '../dist/engine.mjs';
import { createReviewRound, scoreReviewRound } from '../dist/vocabulary-review.mjs';
import { recordObjectiveVocabularyReview } from '../dist/vocabulary-progress.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { buildChatRound, renderChatReview, applyReviewTap, parseReviewTap, reviewTapState, activeReviewSeconds } from '../src/telegram-review.mjs';

function state(base='uz',target='ar',count=8) {
  const course=newCourse();
  course.journey={level:1,evidence:{},recent:{},lastActivity:null};
  course.vocabProgress={};
  for(const word of words.filter(word=>word.level===1).slice(0,count)){
    course.cards[word.id]={step:-1,due:0};
    course.vocabProgress[word.id]={
      introducedAt:10,attempts:0,correct:0,lastAttemptAt:0,reviewEvidence:{}
    };
  }
  return {base,target,courses:{[base+'>'+target]:course}};
}
function advance(row,action,index){
  const result=applyReviewTap(row,action,index);
  assert.ok(result,'a valid action must advance the state');
  Object.assign(row,result);
  return result;
}
function perfectReview(round,{miss=false}={}){
  const row={id:'a'.repeat(20),round_json:JSON.stringify(round),
    cursor:0,matched_json:'[]',matches_json:'[]',evaluations_json:'[]',
    selected_source:null,committed_at:null};
  while(row.cursor<round.stages.length){
    const stage=round.stages[row.cursor];
    if(stage.kind==='choice'){
      const correct=stage.options.findIndex(e=>e.id===stage.entry);
      advance(row,'c',correct);
      continue;
    }
    for(const source of stage.sources){
      if(row.cursor>=round.stages.length)break;
      const sourceIndex=stage.sources.findIndex(e=>e.id===source.id);
      advance(row,'s',sourceIndex);
      const answer=stage.targets.findIndex(e=>e.id===source.id);
      const chosen=miss && stage.direction==='reverse' && source===stage.sources[0]
        ? (answer+1)%stage.targets.length : answer;
      advance(row,'t',chosen);
    }
  }
  return {row,summary:scoreReviewRound(round.entries.map(id=>({id})),JSON.parse(row.evaluations_json))};
}
test('complete bidirectional bot review uses the shared engine for all 30 pairs',()=>{
  for(const base of codes)for(const target of codes){
    if(base===target)continue;
    const initial=state(base,target),round=buildChatRound(initial,seededRandom(13),Date.now());
    assert.ok(round,base+'>'+target);
    assert.equal(round.entries.length,4);
    assert.equal(round.total,16);
    assert.deepEqual(round.stages.filter(e=>e.kind==='choice').map(e=>e.direction).sort().filter((_,i)=>i===0),
      ['forward']);
    assert.equal(round.stages.filter(e=>e.kind==='match').length,2);
    assert.ok(round.stages.every(e=>e.from!==e.to));
    for(const s of round.stages){
      assert.ok([base,target].includes(s.from));
      assert.ok([base,target].includes(s.to));
    }
    const {row,summary}=perfectReview(round);
    assert.equal(row.cursor,round.stages.length);
    assert.deepEqual(summary,{correct:16,total:16,passed:4,
      reviewed:round.entries.map(id=>({id,correct:true}))});
    const current=initial.courses[base+'>'+target],now=Date.now();
    recordObjectiveVocabularyReview(current,JSON.parse(row.evaluations_json),now);
    for(const entry of summary.reviewed)saveReview(current,entry.id,entry.correct,now);
    assert.ok(summary.entries===undefined);
    assert.equal(validateState(initial).courses[base+'>'+target].reviewAssessmentVersion,2);
    for(const id of round.entries)assert.equal(current.cards[id].step,0);
    const first=renderChatReview({...row,cursor:0,matches_json:'[]',selected_source:null});
    assert.match(first.text,/To‘g‘ri tarjimani tanlang/);
    assert.ok(first.reply_markup.inline_keyboard.length>1);
  }
});

test('a wrong reverse matching answer stops that word advancing',()=>{
  const initial=state(),round=buildChatRound(initial,seededRandom(5));
  const {row,summary}=perfectReview(round,{miss:true});
  assert.equal(summary.correct,15);
  assert.equal(summary.passed,3);
  const now=Date.now(),course=initial.courses['uz>ar'];
  recordObjectiveVocabularyReview(course,JSON.parse(row.evaluations_json),now);
  for(const item of summary.reviewed)saveReview(course,item.id,item.correct,now);
  const missed=summary.reviewed.find(item=>!item.correct);
  assert.equal(course.cards[missed.id].step,-1);
  assert.ok(course.cards[missed.id].due<=now+600001);
  assert.equal(course.vocabProgress[missed.id].reviewEvidence.reverseMatch.lastCorrect,false);
});

test('new learners with only 3–5 learned words receive a smaller full round',()=>{
  for(const count of [3,4,5]){
    const round=buildChatRound(state('uz','ar',count),seededRandom(12));
    assert.ok(round);
    assert.equal(round.entries.length,count-2);
    assert.equal(round.total,(count-2)*4);
    assert.equal(perfectReview(round).summary.passed,count-2);
  }
  assert.equal(buildChatRound(state('uz','ar',2)),null);
  assert.equal(buildChatRound({base:'uz',target:'ar',courses:{}}),null);
});

test('matching source selection can be changed without creating a scored answer',()=>{
  const round=buildChatRound(state(),seededRandom(10));
  const firstMatch=round.stages.findIndex(e=>e.kind==='match');
  const row={id:'b'.repeat(20),round_json:JSON.stringify(round),
    cursor:firstMatch,selected_source:null,matches_json:'[]',evaluations_json:'[]'};
  let next=advance(row,'s',0);
  assert.equal(JSON.parse(next.evaluations_json).length,0);
  next=advance(row,'x',0);
  assert.equal(next.selected_source,null);
  assert.equal(JSON.parse(next.evaluations_json).length,0);
  const view=renderChatReview(row);
  assert.match(view.text,/Juftlash/);
  assert.ok(view.reply_markup.inline_keyboard.some(row=>row[0].callback_data.endsWith(':s:0')));
});

test('review buttons do not expose answer keys in callback data',()=>{
  const round=buildChatRound(state(),seededRandom(7));
  const view=renderChatReview({id:'c'.repeat(20),round_json:JSON.stringify(round),
    cursor:0,matches_json:'[]',selected_source:null});
  for(const button of view.reply_markup.inline_keyboard.flat()){
    if(!button.callback_data.startsWith('rv:'))continue;
    assert.match(button.callback_data,/^rv:[a-f0-9]{20}:\d{1,2}:\d{1,6}:c:\d$/);
    assert.ok(Buffer.byteLength(button.callback_data)<=64);
  }
});

test('a late or repeated matching tap is never applied to a later screen',()=>{
  const round=buildChatRound(state(),seededRandom(10));
  const firstMatch=round.stages.findIndex(e=>e.kind==='match');
  const row={id:'d'.repeat(20),round_json:JSON.stringify(round),cursor:firstMatch,version:0,
    selected_source:null,matches_json:'[]',evaluations_json:'[]',message_id:7,expires_at:Date.now()+60000,committed_at:null};
  const message={message_id:7};
  const step=(action,index)=>{Object.assign(row,applyReviewTap(row,action,index));row.version++;};
  // The learner picks word A: the screen now offers translations for A.
  step('s',0);
  const forA=renderChatReview(row).reply_markup.inline_keyboard.flat().find(b=>/:t:\d$/.test(b.callback_data));
  assert.equal(reviewTapState(row,message,parseReviewTap(forA.callback_data)),'current');
  // They go back and pick word B. A late tap meant for A must not be graded as an answer for B.
  step('x',0);
  step('s',1);
  assert.equal(reviewTapState(row,message,parseReviewTap(forA.callback_data)),'stale');
  const forB=renderChatReview(row).reply_markup.inline_keyboard.flat().find(b=>/:t:\d$/.test(b.callback_data));
  assert.equal(reviewTapState(row,message,parseReviewTap(forB.callback_data)),'current');
  // Buttons drawn before versions existed are refreshed, not graded; another message or an expired round is gone.
  assert.equal(reviewTapState(row,message,parseReviewTap('rv:'+row.id+':'+row.cursor+':t:0')),'stale');
  assert.equal(reviewTapState(row,{message_id:8},parseReviewTap(forB.callback_data)),'gone');
  assert.equal(reviewTapState({...row,expires_at:0},message,parseReviewTap(forB.callback_data)),'gone');
  assert.equal(parseReviewTap('rv:short:1:0:t:0'),null);
});

test('review study time counts the gaps between answers, never time away from the chat',()=>{
  const start=1_000_000;
  const at=seconds=>({at:start+seconds*1000});
  // Three answers 20 s apart: one minute.
  assert.equal(activeReviewSeconds(start,[at(20),at(40),at(60)],start+60000),60);
  // A 20-minute pause before the last answer counts as one capped gap (90 s), not 20 minutes.
  assert.equal(activeReviewSeconds(start,[at(20),at(40),at(40+1200)],start+1240000),20+20+90);
  // Answers saved before timestamps existed count at most one capped gap each.
  assert.equal(activeReviewSeconds(start,[{},{}],start+3600000),180);
  // Every graded answer is timestamped.
  const round=buildChatRound(state(),seededRandom(3));
  const row={id:'e'.repeat(20),round_json:JSON.stringify(round),cursor:0,selected_source:null,matches_json:'[]',evaluations_json:'[]'};
  const choice=round.stages[0];
  const next=applyReviewTap(row,'c',choice.options.findIndex(e=>e.id===choice.entry),start+5000);
  assert.equal(JSON.parse(next.evaluations_json)[0].at,start+5000);
});
