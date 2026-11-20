import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { path, lessonUnlocked, accessibleLevel, lessonVocabulary, lessonVocabularyGroups } from '../dist/journey.mjs';
import { newCourse, saveLesson, completed, recordPractice, seededRandom } from '../dist/engine.mjs';
import { buildLessonActivities, recoveryActivity, lessonScore, lessonPassingScore, lessonQuestionTotal, lessonReferenceMatch, lessonQuestionProgress, lessonSequenceSignature, replaySavedLesson } from '../dist/lesson-flow.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';
import { resolveAudio } from '../src/speech.mjs';

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

test('the complete phone number is an audio example on the unscored intro', () => {
  const unit = units.find(unit => unit.id === 'numbers');
  for (const target of codes) {
    const base = target === 'uz' ? 'en' : 'uz';
    const activities = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
    const example = activities[0].examples.find(entry => entry.id === 'example-numbers-phone');
    assert.ok(example?.text[target]);
    assert.equal(resolveAudio(example.id, target, 'f').text, example.text[target]);
    assert.equal(lessonQuestionTotal(activities), 8);
    assert.ok(activities.every(task => task.entry.id !== example.id));
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
    // No word is asked about before the card that teaches it, and each preview
    // card stays within one topic group and at most eight words.
    const groups = lessonVocabularyGroups(unit);
    const groupByWord = new Map(groups.flatMap(group => group.words.map(word => [word.id, group.id])));
    const cards = tasks.map((task, index) => ({ task, index })).filter(({ task }) => task.task === 'word-intro');
    const asked = tasks.findIndex(task => task.task === 'word-meaning');
    assert.equal(cards.length >= 1, vocabulary.length >= 1, unit.id);
    if (cards.length) {
      assert.ok(cards.every(({ index }) => asked > index), unit.id + ': the word is asked about before it is taught');
      assert.deepEqual(cards.flatMap(({ task }) => task.examples), vocabulary);
      for (const { task } of cards) {
        assert.ok(task.examples.length >= 1 && task.examples.length <= 8, unit.id + ': card size ' + task.examples.length);
        assert.equal(new Set(task.examples.map(word => groupByWord.get(word.id))).size, 1, unit.id + ': mixed groups on one card');
        assert.equal(task.core, false);
      }
      assert.ok(vocabulary.includes(tasks[asked].entry), unit.id);
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
  const keys = ['lessonFlowIntro','lessonFlowWritePrompt',
    'lessonFlowWriteOpen','lessonFlowDictation','lessonFlowSpeak','lessonFlowSpeakOpen','lessonFlowReference',
    'lessonFlowRecovery','lessonFlowRetry','lessonFlowCompare',
    'lessonSpeakLabel','lessonSpeechStart','lessonSpeechListening','lessonSpeechMatch',
    'lessonSpeechMismatch','lessonSpeechUnavailable','lessonSpeechError',
    'lessonSpeechDenied'];
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

test('multi-group and oversized lessons split word-intro along group boundaries without changing pass counts', () => {
  const expectedSplits = {
    introductions: [8, 5],
    numbers: [7, 7],
    colors: [6, 6],
    'polite-requests': [6, 8],
    belongings: [8, 5],
    family: [5, 6],
    routine: [8, 6, 6],
    apartment: [8, 8],
    'free-time': [6, 5],
    outdoors: [6, 8],
    wellbeing: [6, 8],
    'telling-time': [8, 6],
    directions: [4, 5],
    'inside-a-building': [6, 6]
  };
  for (const [id, sizes] of Object.entries(expectedSplits)) {
    const unit = units.find(candidate => candidate.id === id);
    const standard = buildLessonActivities(unit, newCourse(), 'uz', 'en', seededRandom(17));
    const introSizes = standard.filter(task => task.task === 'word-intro').map(task => task.examples.length);
    assert.deepEqual(introSizes, sizes, id + ' split');
    assert.equal(lessonQuestionTotal(standard), 8, id + ' standard total');
    assert.equal(lessonPassingScore(lessonQuestionTotal(standard)), 7, id + ' standard pass');
    const adaptiveCourse = newCourse();
    adaptiveCourse.journey = { level: unit.level, evidence: {}, recent: { listening: [false, false, false, false] }, lastActivity: null };
    const adaptive = buildLessonActivities(unit, adaptiveCourse, 'uz', 'en', seededRandom(17));
    assert.deepEqual(adaptive.filter(task => task.task === 'word-intro').map(task => task.examples.length), sizes);
    assert.equal(lessonQuestionTotal(adaptive), 9, id + ' adaptive total');
    assert.equal(lessonPassingScore(lessonQuestionTotal(adaptive)), 8, id + ' adaptive pass');
  }
});

test('replaySavedLesson resumes unaffected lessons (including recovery cards) and cleanly rejects cross-release sequence shifts', () => {
  const buildAnswers = (sequence, count, wrongIndices = new Set()) => {
    const live = [...sequence];
    const answers = [];
    let recoveries = 0;
    while (answers.length < count) {
      const index = answers.length;
      const question = live[index];
      const entry = question.studyEntry ?? question.entry;
      const correct = question.core ? !wrongIndices.has(index) : false;
      answers.push({ id: entry.id, task: question.task, correct, scored: Boolean(question.core) });
      if (question.core && !correct && recoveries < 2) {
        live.splice(index + 1, 0, recoveryActivity(question));
        recoveries++;
      }
    }
    return { live, answers, recoveries };
  };

  // 1. Unaffected lesson resumes cleanly, even after two mistakes inserted recovery cards.
  const greetings = units.find(unit => unit.id === 'greetings');
  const greetingsSeq = buildLessonActivities(greetings, newCourse(), 'uz', 'tr', seededRandom(99));
  const greetingsSig = lessonSequenceSignature(greetingsSeq);
  const withRecoveries = buildAnswers(greetingsSeq, 6, new Set([1, 3]));
  assert.equal(withRecoveries.recoveries, 2);
  const resumed = replaySavedLesson({ signature: greetingsSig, answers: withRecoveries.answers }, greetingsSeq);
  assert.ok(resumed);
  assert.equal(resumed.index, 6);
  assert.equal(resumed.recoveries, 2);
  assert.equal(resumed.signature, greetingsSig);
  assert.deepEqual(resumed.questions.map(item => item.task), withRecoveries.live.map(item => item.task));

  // 2. Missing-signature (legacy v1-shaped) session on Numbers is rejected at the
  //    signature check; even with a matching signature, the scored !== core guard
  //    rejects a scored answer landing on an unscored second word-intro card.
  const numbers = units.find(unit => unit.id === 'numbers');
  const numbersSplit = buildLessonActivities(numbers, newCourse(), 'uz', 'en', seededRandom(42));
  const secondCardWord = numbersSplit.filter(task => task.task === 'word-intro')[1].entry;
  const preSplitNumbers = numbersSplit.filter((_, index) => index !== numbersSplit.findIndex(t => t.task === 'word-intro') + 1);
  const preSplitAsked = preSplitNumbers.findIndex(task => task.task === 'word-meaning');
  const preSplitAnswers = buildAnswers(preSplitNumbers, preSplitAsked + 1).answers;
  preSplitAnswers[preSplitAsked] = { id: secondCardWord.id, correct: true, scored: true };
  assert.equal(replaySavedLesson({ answers: preSplitAnswers }, numbersSplit), null);
  assert.equal(replaySavedLesson({ signature: lessonSequenceSignature(numbersSplit), answers: preSplitAnswers }, numbersSplit), null);

  // 3. PR 1 -> PR 2 rollout on Introductions: a PR 1 session (before pronouns card)
  //    saved right after word-meaning is cleanly rejected by the PR 2 sequence.
  const introductions = units.find(unit => unit.id === 'introductions');
  const introPr2 = buildLessonActivities(introductions, newCourse(), 'uz', 'en', seededRandom(12));
  const introPr1 = introPr2.filter((_, index) => index !== introPr2.findIndex(t => t.task === 'word-intro') + 1);
  const introAsked = introPr1.findIndex(task => task.task === 'word-meaning');
  const introSaved = {
    signature: lessonSequenceSignature(introPr1),
    answers: buildAnswers(introPr1, introAsked + 1).answers
  };
  assert.equal(replaySavedLesson(introSaved, introPr2), null);

  // 4. PR 1 -> PR 2 rollout on Family: the live PR 2 split's second card starts with
  //    existing word-relatives-6 ("son"); both signature check and scored/task guards reject a PR 1 session.
  const family = units.find(unit => unit.id === 'family');
  const familyPr2 = buildLessonActivities(family, newCourse(), 'uz', 'en', seededRandom(7));
  const familySecondCard = familyPr2.filter(task => task.task === 'word-intro')[1];
  assert.equal(familySecondCard.entry.id, 'word-relatives-6');
  const familyPr1 = familyPr2.filter(task => task !== familySecondCard);
  const familyAsked = familyPr1.findIndex(task => task.task === 'word-meaning');
  const familySaved = {
    signature: lessonSequenceSignature(familyPr1),
    answers: buildAnswers(familyPr1, familyAsked + 1).answers
  };
  familySaved.answers[familyAsked] = { id: familySecondCard.entry.id, task: 'word-meaning', correct: true, scored: true };
  assert.equal(replaySavedLesson(familySaved, familyPr2), null);
  // Even if a crafted payload carried the new signature, scored !== core and task mismatch still reject it.
  assert.equal(replaySavedLesson({ ...familySaved, signature: lessonSequenceSignature(familyPr2) }, familyPr2), null);

  // 5. Same PR 1 -> PR 2 release: an unaffected lesson (Cafe) continues to resume cleanly.
  const cafe = units.find(unit => unit.id === 'cafe');
  const cafeSeq = buildLessonActivities(cafe, newCourse(), 'uz', 'en', seededRandom(5));
  const cafeSaved = {
    signature: lessonSequenceSignature(cafeSeq),
    answers: buildAnswers(cafeSeq, 4).answers
  };
  const cafeResumed = replaySavedLesson(cafeSaved, cafeSeq);
  assert.ok(cafeResumed);
  assert.equal(cafeResumed.index, 4);
});
