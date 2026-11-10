import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { path, lessonUnlocked, accessibleLevel } from '../dist/journey.mjs';
import { newCourse, saveLesson, completed } from '../dist/engine.mjs';
import { buildLessonActivities, recoveryActivity, lessonScore, lessonCoreTotal, lessonPassingScore, lessonReferenceMatch } from '../dist/lesson-flow.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';

const coreKinds = new Set(['translation', 'gap', 'order', 'context-reading', 'final-choice']);
const asAnswers = (tasks, correctCount) => {
  let graded = 0;
  return tasks.map(task => ({
    id: (task.studyEntry ?? task.entry).id,
    correct: task.core ? ++graded <= correctCount : false,
    scored: Boolean(task.core)
  }));
};

test('every one of 56 lessons across all thirty language directions gets a mixed four-skill sequence', () => {
  assert.equal(units.length, 56);
  assert.equal(path.length, 8);
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const unit of units) {
      const tasks = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
      assert.ok(tasks.length >= 10, unit.id);
      assert.equal(tasks.filter(task => task.core).length, lessonCoreTotal);
      assert.equal(tasks[0].task, 'intro');
      assert.equal(tasks.at(-1).task, 'final-choice');
      assert.equal(tasks.filter(task => task.task === 'listen').length, 1);
      assert.equal(tasks.filter(task => task.task === 'dictation').length, 1);
      assert.equal(tasks.filter(task => task.task === 'write').length, 1);
      assert.equal(tasks.filter(task => task.task === 'speak').length, 1);
      assert.equal(tasks.filter(task => task.task === 'context-reading').length, 1);
      for (const task of tasks) {
        assert.ok(task.entry.text[target] || task.studyEntry?.text[target], unit.id);
        assert.ok(task.entry.level === unit.level || task.studyEntry?.level === unit.level, unit.id);
        if (task.core) assert.ok(coreKinds.has(task.task), task.task);
      }
    }
  }
});

test('all mixed lesson stages draw only on the requested unit; advanced tasks request original language', () => {
  for (const unit of units) {
    const ids = new Set(unit.phrases.map(p => p.id));
    const tasks = buildLessonActivities(unit, newCourse(), 'uz', 'tr');
    for (const task of tasks) {
      const entry = task.studyEntry ?? task.entry;
      assert.ok(ids.has(entry.id), unit.id + ' ' + task.task);
      if (['write', 'speak'].includes(task.task) && task.context) assert.equal(task.context, unit.description);
      if (task.task === 'context-reading') assert.ok(ids.has(task.context.id));
    }
    const free = tasks.filter(q => q.task === 'write' || q.task === 'speak');
    assert.ok(free.every(q => q.openEnded === (unit.level >= 5)));
  }
});

test('four correct core answers unlock a lesson, while missing audio and open tasks do not subtract marks', () => {
  for (const unit of units) {
    const tasks = buildLessonActivities(unit, newCourse(), 'en', 'de');
    const pass = asAnswers(tasks, 4);
    const score = lessonScore(tasks, pass);
    assert.deepEqual(score, { correct: 4, total: 5, passed: true });
    assert.equal(lessonScore(tasks, asAnswers(tasks, 3)).passed, false);
    assert.equal(lessonPassingScore, 4);
    const course = newCourse();
    const required = pass.filter(answer => answer.scored);
    assert.equal(saveLesson(course, unit, required), 4);
    assert.equal(completed(unit, course), true);
    const stored = validateState({ base: 'en', target: 'de', courses: { 'en>de': course } });
    assert.equal(stored.courses['en>de'].best[unit.id], 4);
  }
});

test('a failing first lesson remains locked until its core score improves', () => {
  const course = newCourse();
  const first = path[0].units[0];
  const second = path[0].units[1];
  const tasks = buildLessonActivities(first, course, 'uz', 'en');
  assert.equal(lessonUnlocked(course, first), true);
  assert.equal(lessonUnlocked(course, second), false);
  const failed = asAnswers(tasks, 3).filter(x => x.scored);
  saveLesson(course, first, failed);
  assert.equal(lessonUnlocked(course, second), false);
  const passing = asAnswers(tasks, 4).filter(x => x.scored);
  saveLesson(course, first, passing);
  assert.equal(lessonUnlocked(course, second), true);
  assert.equal(accessibleLevel(course), 1);
});

test('recovery cards do not change the graded question count even after several errors', () => {
  const unit = units[2];
  const tasks = buildLessonActivities(unit, newCourse(), 'uz', 'tr', () => 0.53);
  for (const missed of tasks.filter(q => q.core).slice(0, 2)) {
    const recovery = recoveryActivity(missed);
    assert.equal(recovery.task, 'recovery');
    assert.equal(recovery.core, false);
    assert.equal(recovery.entry, missed.studyEntry ?? missed.entry);
    tasks.splice(tasks.indexOf(missed) + 1, 0, recovery);
  }
  const result = lessonScore(tasks, asAnswers(tasks, 4));
  assert.equal(result.passed, true);
  assert.equal(result.total, 5);
  assert.throws(() => lessonScore(tasks, asAnswers(tasks, 4).slice(1)));
});

test('optional practice is adjusted after weakness evidence without changing the scoring gate', () => {
  for (const skill of ['listening', 'recall', 'reading']) {
    const current = newCourse();
    current.journey = { level: 3, evidence: {}, recent: { [skill]: [false, false, true, false] }, lastActivity: null };
    const tasks = buildLessonActivities(units.find(unit => unit.level === 3), current, 'uz', 'tr', () => 0.43);
    assert.equal(tasks.length, 11);
    assert.equal(tasks.filter(task => task.core).length, lessonCoreTotal);
    assert.equal(tasks.at(-1).task, 'final-choice');
    assert.ok(tasks.some(task => task.core === false));
  }
});

test('speaking self-review and open writing reference matching never claim a certification score', () => {
  assert.equal(lessonReferenceMatch(' Merhaba! ', { text: { tr: 'merhaba' } }, 'tr'), true);
  assert.equal(lessonReferenceMatch('Ben çay istiyorum', { text: { tr: 'Kahve istiyorum' } }, 'tr'), false);
  const tasks = buildLessonActivities(units.find(unit => unit.level === 7), newCourse(), 'uz', 'de');
  assert.equal(tasks.find(task => task.task === 'speak').core, false);
  assert.equal(tasks.find(task => task.task === 'write').core, false);
});

test('all interface languages have labels for mixed-lesson interactions', () => {
  const keys = ['lessonFlowIntro','lessonFlowIntroLead','lessonFlowReadPrompt','lessonFlowWritePrompt',
    'lessonFlowWriteOpen','lessonFlowDictation','lessonFlowSpeak','lessonFlowSpeakOpen','lessonFlowReference',
    'lessonFlowRecovery','lessonFlowPass','lessonFlowRetry','lessonFlowCompare'];
  for (const code of codes) for (const key of keys) {
    assert.ok(copy[code][key]?.trim(), code + ': ' + key);
  }
});
