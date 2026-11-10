import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { path, lessonUnlocked, accessibleLevel } from '../dist/journey.mjs';
import { newCourse, saveLesson, completed } from '../dist/engine.mjs';
import { buildLessonActivities, recoveryActivity, lessonScore, lessonPassingScore, lessonQuestionTotal, lessonReferenceMatch, lessonQuestionProgress } from '../dist/lesson-flow.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';

const coreKinds = new Set(['translation', 'listen', 'gap', 'reverse-translation', 'write', 'dictation', 'speak', 'final-choice', 'reading-practice']);
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
      assert.ok(tasks.length >= 9, unit.id);
      assert.equal(tasks.filter(task => task.core).length, 8);
      assert.equal(lessonQuestionTotal(tasks), 8);
      assert.equal(tasks[0].task, 'intro');
      assert.equal(tasks.at(-1).task, 'final-choice');
      assert.equal(tasks.filter(task => task.task === 'listen').length, 1);
      assert.equal(tasks.filter(task => task.task === 'dictation').length, 1);
      assert.equal(tasks.filter(task => task.task === 'write').length, 1);
      assert.equal(tasks.filter(task => task.task === 'speak').length, 1);
      assert.ok(!tasks.some(task => task.task === 'context-reading'), unit.id);
      assert.equal(tasks.filter(task => task.task === 'reverse-translation').length, 1);
      assert.ok(!tasks.some(task => task.task === 'order'));
      const reverse = tasks.find(task => task.task === 'reverse-translation');
      assert.equal(reverse.from, base);
      assert.equal(reverse.to, target);
      assert.equal(reverse.core, true);
      assert.equal(tasks.find(task => task.task === 'write').core, true);
      for (const task of tasks) {
        assert.ok(task.entry.text[target] || task.studyEntry?.text[target], unit.id);
        assert.ok(task.entry.level === unit.level || task.studyEntry?.level === unit.level, unit.id);
        if (task.core) assert.ok(coreKinds.has(task.task), task.task);
      }
    }
  }
});

test('intro is a standalone preview, followed by question 1 of 8 for all directions', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const unit of units) {
      const activities = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
      assert.equal(activities[0].task, 'intro');
      assert.equal(lessonQuestionProgress(activities, 0), null);
      assert.deepEqual(lessonQuestionProgress(activities, 1), { step: 1, total: 8 });
      assert.deepEqual(lessonQuestionProgress(activities, activities.length - 1), { step: 8, total: 8 });
    }
  }
});

test('review cards never increase the displayed lesson question count', () => {
  const unit = units[1];
  const activities = buildLessonActivities(unit, newCourse(), 'uz', 'ar', () => 0.31);
  const originalTotal = lessonQuestionProgress(activities, 1).total;
  const firstQuestion = activities[1];
  activities.splice(2, 0, recoveryActivity(firstQuestion));
  assert.equal(lessonQuestionProgress(activities, 2), null);
  assert.deepEqual(lessonQuestionProgress(activities, 3), { step: 2, total: originalTotal });
  assert.deepEqual(lessonQuestionProgress(activities, activities.length - 1), {
    step: originalTotal, total: originalTotal
  });
  assert.equal(lessonQuestionProgress(activities, -1), null);
  assert.equal(lessonQuestionProgress(activities, activities.length), null);
});

test('all mixed lesson stages draw on their own unit; writing always uses word banks', () => {
  for (const unit of units) {
    const ids = new Set(unit.phrases.map(p => p.id));
    const tasks = buildLessonActivities(unit, newCourse(), 'uz', 'tr');
    for (const task of tasks) {
      const entry = task.studyEntry ?? task.entry;
      assert.ok(ids.has(entry.id), unit.id + ' ' + task.task);
      if (['write', 'speak'].includes(task.task) && task.context) assert.equal(task.context, unit.description);
    }
    const writing = tasks.filter(q => q.task === 'write');
    const speaking = tasks.filter(q => q.task === 'speak');
    assert.ok(writing.every(task => task.core && !task.openEnded && task.wordBank?.expected.length));
    assert.ok(speaking.every(task => task.openEnded === (unit.level >= 5)));
  }
});

test('at least 80% of all eight answers unlock a lesson without relocking old completions', () => {
  for (const unit of units) {
    const tasks = buildLessonActivities(unit, newCourse(), 'en', 'de');
    const pass = asAnswers(tasks, 7);
    assert.deepEqual(lessonScore(tasks, pass), { correct: 7, total: 8, passed: true });
    assert.equal(lessonScore(tasks, asAnswers(tasks, 6)).passed, false);
    assert.equal(lessonPassingScore(8), 7);
    const course = newCourse();
    assert.equal(saveLesson(course, unit, pass.filter(answer => answer.scored), Date.now(), 7), 7);
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
  const failed = asAnswers(tasks, 6).filter(x => x.scored);
  saveLesson(course, first, failed, Date.now(), 7);
  assert.equal(lessonUnlocked(course, second), false);
  const passing = asAnswers(tasks, 7).filter(x => x.scored);
  saveLesson(course, first, passing, Date.now(), 7);
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
  const result = lessonScore(tasks, asAnswers(tasks, 7));
  assert.equal(result.passed, true);
  assert.equal(result.total, 8);
  assert.throws(() => lessonScore(tasks, asAnswers(tasks, 7).slice(1)));
});

test('adaptive extra questions increase both the score denominator and its 80% threshold', () => {
  for (const skill of ['listening', 'recall', 'reading']) {
    const current = newCourse();
    current.journey = { level: 3, evidence: {}, recent: { [skill]: [false, false, true, false] }, lastActivity: null };
    const tasks = buildLessonActivities(units.find(unit => unit.level === 3), current, 'uz', 'tr', () => 0.43);
    assert.equal(tasks.length, 10);
    assert.equal(tasks.filter(task => task.core).length, 9);
    assert.equal(lessonQuestionTotal(tasks), 9);
    assert.equal(lessonPassingScore(9), 8);
    assert.deepEqual(lessonScore(tasks, asAnswers(tasks, 7)), { correct: 7, total: 9, passed: false });
    assert.deepEqual(lessonScore(tasks, asAnswers(tasks, 8)), { correct: 8, total: 9, passed: true });
    assert.equal(tasks.at(-1).task, 'final-choice');
    assert.ok(tasks.some(task => task.core === false && task.task === 'intro'));
  }
});

test('speaking offers optional recording with an objectively scored meaning choice', () => {
  assert.equal(lessonReferenceMatch(' Merhaba! ', { text: { tr: 'merhaba' } }, 'tr'), true);
  assert.equal(lessonReferenceMatch('Ben çay istiyorum', { text: { tr: 'Kahve istiyorum' } }, 'tr'), false);
  const tasks = buildLessonActivities(units.find(unit => unit.level === 7), newCourse(), 'uz', 'de');
  assert.equal(tasks.find(task => task.task === 'speak').core, true);
  assert.equal(tasks.find(task => task.task === 'speak').options.length, 4);
  assert.equal(tasks.find(task => task.task === 'write').core, true);
});

test('a word-bank writing mistake is counted without adding an extra graded question', () => {
  const round = buildLessonActivities(units[0], newCourse(), 'uz', 'tr', () => 0.38);
  const writingIndex = round.findIndex(task => task.task === 'write');
  assert.ok(writingIndex >= 0);
  const passing = asAnswers(round, 8);
  passing[writingIndex].correct = false;
  assert.deepEqual(lessonScore(round, passing), { correct: 7, total: 8, passed: true });
  const failing = [...passing.map(a => ({ ...a }))];
  const other = round.findIndex((task, i) => i !== writingIndex && task.core);
  failing[other].correct = false;
  assert.deepEqual(lessonScore(round, failing), { correct: 6, total: 8, passed: false });
});

test('adaptive reading practice shows one phrase, never two unrelated samples', () => {
  const course = newCourse();
  course.journey = { level: 3, evidence: {}, recent: { reading: [false, false, true, false] }, lastActivity: null };
  const tasks = buildLessonActivities(units.find(unit => unit.level === 3), course, 'uz', 'ar', () => 0.29);
  const reading = tasks.find(task => task.task === 'reading-practice');
  assert.ok(reading);
  assert.equal(reading.core, true);
  assert.equal(reading.context, undefined);
  assert.ok(reading.entry.text.ar);
  assert.ok(!tasks.some(task => task.task === 'context-reading'));
});

test('all interface languages have labels for mixed-lesson interactions', () => {
  const keys = ['lessonFlowIntro','lessonFlowIntroLead','lessonFlowWritePrompt',
    'lessonFlowWriteOpen','lessonFlowDictation','lessonFlowSpeak','lessonFlowSpeakOpen','lessonFlowReference',
    'lessonFlowRecovery','lessonFlowPass','lessonFlowRetry','lessonFlowCompare'];
  for (const code of codes) for (const key of keys) {
    assert.ok(copy[code][key]?.trim(), code + ': ' + key);
  }
});

test('incomplete 6/8 and 7/9 attempts do not unlock, but legacy 4/5 passes remain complete', () => {
  const unit = units[0];
  const course = newCourse();
  const standard = buildLessonActivities(unit, course, 'uz', 'tr', () => 0.4);
  assert.equal(saveLesson(course, unit, asAnswers(standard, 6).filter(a => a.scored), Date.now(), 7), 6);
  assert.equal(completed(unit, course), false);
  assert.equal(course.best[unit.id], 3);
  const extraCourse = newCourse();
  extraCourse.journey = { level: 1, evidence: {}, recent: { listening: [false, false, false] }, lastActivity: null };
  const adaptive = buildLessonActivities(unit, extraCourse, 'uz', 'tr', () => 0.4);
  assert.equal(lessonQuestionTotal(adaptive), 9);
  saveLesson(extraCourse, unit, asAnswers(adaptive, 7).filter(a => a.scored), Date.now(), 8);
  assert.equal(completed(unit, extraCourse), false);
  const legacy = newCourse();
  legacy.best[unit.id] = 4;
  saveLesson(legacy, unit, asAnswers(standard, 0).filter(a => a.scored), Date.now(), 7);
  assert.equal(completed(unit, legacy), true);
});

test('dictation and listening choices both contribute to the displayed total', () => {
  const tasks = buildLessonActivities(units[0], newCourse(), 'uz', 'tr', () => 0.24);
  for (const kind of ['listen', 'dictation']) {
    const index = tasks.findIndex(q => q.task === kind);
    const answers = asAnswers(tasks, 8);
    answers[index].correct = false;
    assert.deepEqual(lessonScore(tasks, answers), { correct: 7, total: 8, passed: true });
  }
});
