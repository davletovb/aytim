import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { path, lessonUnlocked, accessibleLevel, lessonVocabulary } from '../dist/journey.mjs';
import { newCourse, saveLesson, completed, recordPractice } from '../dist/engine.mjs';
import { buildLessonActivities, recoveryActivity, lessonScore, lessonPassingScore, lessonQuestionTotal, lessonReferenceMatch, lessonQuestionProgress } from '../dist/lesson-flow.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';

const coreKinds = new Set(['translation', 'listen', 'gap', 'reverse-translation', 'write', 'dictation', 'final-choice', 'reading-practice', 'word-meaning']);
const asAnswers = (tasks, correctCount) => {
  let graded = 0;
  return tasks.map(task => ({
    id: (task.studyEntry ?? task.entry).id,
    correct: task.core ? ++graded <= correctCount : false,
    scored: Boolean(task.core)
  }));
};

test('every one of 64 lessons across all thirty language directions gets a mixed four-skill sequence', () => {
  assert.equal(units.length, 64);
  assert.equal(path.length, 8);
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const unit of units) {
      const tasks = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
      assert.ok(tasks.length >= 10, unit.id);
      assert.equal(tasks.filter(task => task.core).length, 8);
      assert.equal(lessonQuestionTotal(tasks), 8);
      assert.equal(tasks[0].task, 'intro');
      assert.equal(tasks.at(-1).task, 'final-choice');
      assert.equal(tasks.filter(task => task.task === 'listen').length, 1);
      const multiword = unit.phrases.some(entry => entry.text[target].trim().split(/\s+/u).length > 1);
      assert.equal(tasks.filter(task => task.task === 'dictation').length, Number(multiword));
      assert.equal(tasks.filter(task => task.task === 'write').length, Number(multiword));
      assert.equal(tasks.filter(task => task.task === 'speak').length, 1);
      assert.ok(!tasks.some(task => task.task === 'context-reading'), unit.id);
      assert.equal(tasks.filter(task => task.task === 'reverse-translation').length, 1);
      assert.ok(!tasks.some(task => task.task === 'order'));
      const reverse = tasks.find(task => task.task === 'reverse-translation');
      assert.equal(reverse.from, base);
      assert.equal(reverse.to, target);
      assert.equal(reverse.core, true);
      assert.ok(tasks.filter(task => task.task === 'write').every(task =>
        task.core && task.wordBank.expected.length > 1));
      assert.ok(tasks.filter(task => task.task === 'dictation').every(task =>
        task.core && task.wordBank.expected.length > 1));
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
      assert.equal(lessonQuestionProgress(activities, activities.findIndex(task => task.task === 'speak')), null);
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
    const vocabulary = lessonVocabulary(unit);
    const ids = new Set([...unit.phrases, ...vocabulary].map(p => p.id));
    const tasks = buildLessonActivities(unit, newCourse(), 'uz', 'tr');
    for (const task of tasks) {
      const entry = task.studyEntry ?? task.entry;
      assert.ok(ids.has(entry.id), unit.id + ' ' + task.task);
      if (['write', 'speak'].includes(task.task) && task.context) assert.equal(task.context, unit.description);
    }
    // No word is asked about before the card that teaches it.
    const card = tasks.findIndex(task => task.task === 'word-intro');
    const asked = tasks.findIndex(task => task.task === 'word-meaning');
    assert.equal(card >= 0, vocabulary.length >= 1, unit.id);
    if (card >= 0) {
      assert.ok(asked > card, unit.id + ': the word is asked about before it is taught');
      assert.deepEqual(tasks[card].examples, vocabulary);
      assert.ok(vocabulary.includes(tasks[asked].entry), unit.id);
      assert.equal(tasks[card].core, false);
      assert.equal(tasks[asked].core, true);
    }
    const writing = tasks.filter(q => q.task === 'write');
    const speaking = tasks.filter(q => q.task === 'speak');
    assert.ok(writing.every(task => task.core && !task.openEnded && task.wordBank?.expected.length > 1));
    assert.ok(speaking.every(task => !task.core && !task.options));
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
    assert.equal(saveLesson(course, unit, pass.filter(answer => answer.scored)), 7);
    assert.equal(completed(unit, course), true);
    const stored = validateState({ base: 'en', target: 'de', courses: { 'en>de': course } });
    assert.equal(stored.courses['en>de'].best[unit.id], 88);
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
  saveLesson(course, first, failed);
  assert.equal(lessonUnlocked(course, second), false);
  const passing = asAnswers(tasks, 7).filter(x => x.scored);
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
    assert.equal(tasks.length, 12);
    assert.equal(tasks.filter(task => task.core).length, 9);
    assert.equal(lessonQuestionTotal(tasks), 9);
    assert.equal(lessonPassingScore(9), 8);
    assert.deepEqual(lessonScore(tasks, asAnswers(tasks, 7)), { correct: 7, total: 9, passed: false });
    assert.deepEqual(lessonScore(tasks, asAnswers(tasks, 8)), { correct: 8, total: 9, passed: true });
    assert.equal(tasks.at(-1).task, 'final-choice');
    assert.ok(tasks.some(task => task.core === false && task.task === 'intro'));
  }
});

test('speaking transcript matching gives feedback without a meaning choice or pass penalty', () => {
  assert.equal(lessonReferenceMatch(' Merhaba! ', { text: { tr: 'merhaba' } }, 'tr'), true);
  assert.equal(lessonReferenceMatch('Ben çay istiyorum', { text: { tr: 'Kahve istiyorum' } }, 'tr'), false);
  const tasks = buildLessonActivities(units.find(unit => unit.level === 7), newCourse(), 'uz', 'de');
  const index = tasks.findIndex(task => task.task === 'speak');
  assert.equal(tasks[index].core, false);
  assert.equal(tasks[index].options, undefined);
  assert.equal(lessonQuestionProgress(tasks, index), null);
  const answers = asAnswers(tasks, 8);
  answers[index].correct = false;
  assert.deepEqual(lessonScore(tasks, answers), { correct: 8, total: 8, passed: true });
  assert.equal(lessonReferenceMatch('مرحبا', { text: { ar: 'مَرْحَبًا!' } }, 'ar'), true);
  assert.ok(tasks.filter(task => task.task === 'write').every(task => task.core));
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
    'lessonFlowRecovery','lessonFlowPass','lessonFlowRetry','lessonFlowCompare',
    'lessonSpeakLabel','lessonSpeechStart','lessonSpeechListening','lessonSpeechMatch',
    'lessonSpeechMismatch','lessonSpeechHeard','lessonSpeechUnavailable','lessonSpeechError',
    'lessonSpeechDenied','lessonSpeechPrivacy'];
  for (const code of codes) for (const key of keys) {
    assert.ok(copy[code][key]?.trim(), code + ': ' + key);
  }
});

test('incomplete 6/8 and 7/9 attempts do not unlock; saved progress is a percent', () => {
  const unit = units[0];
  const course = newCourse();
  const standard = buildLessonActivities(unit, course, 'uz', 'tr', () => 0.4);
  assert.equal(saveLesson(course, unit, asAnswers(standard, 6).filter(a => a.scored)), 6);
  assert.equal(completed(unit, course), false);
  assert.equal(course.best[unit.id], 75);
  const extraCourse = newCourse();
  extraCourse.journey = { level: 1, evidence: {}, recent: { listening: [false, false, false, false] }, lastActivity: null };
  const adaptive = buildLessonActivities(unit, extraCourse, 'uz', 'tr', () => 0.4);
  assert.equal(lessonQuestionTotal(adaptive), 9);
  saveLesson(extraCourse, unit, asAnswers(adaptive, 7).filter(a => a.scored));
  assert.equal(completed(unit, extraCourse), false);
  assert.equal(extraCourse.best[unit.id], 78);
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

test('word ordering never requires placing a single tile across all language directions', () => {
  for (const unit of units) for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    const tasks = buildLessonActivities(unit, newCourse(), base, target, () => 0.38);
    for (const task of tasks.filter(item => ['write', 'dictation'].includes(item.task))) {
      assert.ok(task.wordBank.expected.length > 1, unit.id + ' ' + target + ' ' + task.task);
    }
  }
});

test('a lesson whose target phrases are all one word falls back to meaningful choices', () => {
  // Keep catalog IDs so practice distractors can be drawn from the real unit,
  // while replacing the target translations with one-word fixture data.
  const original = units[0];
  const unit = { ...original, phrases: original.phrases.map((entry, i) => ({
    ...entry, text: { ...entry.text, tr: 'kelime' + i }
  })) };
  const tasks = buildLessonActivities(unit, newCourse(), 'uz', 'tr', () => 0.33);
  assert.ok(!tasks.some(task => ['write', 'dictation'].includes(task.task)));
  assert.equal(lessonQuestionTotal(tasks), 8);
  assert.ok(tasks.some(task => task.task === 'speak' && !task.core));
});

test('every scored lesson question names the language of its answer', () => {
  // A missing answer language broke the feedback after a wrong word-bank answer.
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const unit of units) {
      for (const recent of [{}, { recall: [false, false, false, false] }]) {
        const course = { ...newCourse(), journey: { level: unit.level, evidence: {}, recent, lastActivity: null } };
        for (const task of buildLessonActivities(unit, course, base, target, () => 0.37).filter(item => item.core)) {
          assert.ok(codes.includes(task.to), unit.id + ' ' + task.task + ' has no answer language');
          assert.ok((task.studyEntry ?? task.entry).text[task.to]?.trim(), unit.id + ' ' + task.task);
          if (task.task === 'write') assert.deepEqual([task.from, task.to], [base, target]);
        }
      }
    }
  }
});

test('a phrase missed anywhere in a lesson stays due for review, whatever the answer order', () => {
  const now = 1_000_000_000_000;
  for (const answers of [
    [{ id: 'p', correct: false }, { id: 'p', correct: true }],
    [{ id: 'p', correct: true }, { id: 'p', correct: false }]
  ]) {
    const course = newCourse();
    course.cards.p = { step: 2, due: now - 1 };
    recordPractice(course, answers, now);
    assert.deepEqual(course.cards.p, { step: -1, due: now });
  }
  const fresh = newCourse();
  recordPractice(fresh, [{ id: 'q', correct: true }, { id: 'q', correct: true }], now);
  assert.deepEqual(fresh.cards.q, { step: 0, due: now + 24 * 60 * 60 * 1000 });
});
