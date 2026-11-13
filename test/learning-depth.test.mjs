import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units, phrases } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { stories, storyPassed } from '../dist/stories.mjs';
import { extendedStories } from '../dist/extended-stories.mjs';
import { lessonVocabulary } from '../dist/journey.mjs';
import { newCourse, recordPractice, reviewQueue, saveReview } from '../dist/engine.mjs';
import { introduceVocabulary, recordObjectiveVocabularyReview, vocabularyCoverage } from '../dist/vocabulary-progress.mjs';
import { lessonScore, buildLessonActivities, lessonQuestionTotal } from '../dist/lesson-flow.mjs';
import { readingQuestions } from '../dist/practice.mjs';
import { readingAid } from '../dist/reading-aid.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';

const day = 86400000;

test('F04 every one of the 359 vocabulary words is introduced exactly once by one of 64 lessons', () => {
  const course = newCourse();
  const now = 1_700_000_000_000;
  let scheduled = 0;
  for (const unit of units) scheduled += introduceVocabulary(course, lessonVocabulary(unit), now);
  assert.equal(scheduled, words.length);
  assert.equal(words.length, 359);
  assert.equal(Object.keys(course.vocabProgress).length, words.length);
  assert.deepEqual(vocabularyCoverage(course, words, now), {
    total: 359, introduced: 359, tested: 0, bidirectional: 0, due: 0, retained: 0
  });
  assert.ok(words.every(word => course.cards[word.id].step === -1 &&
    course.cards[word.id].due === now + day));
  assert.equal(introduceVocabulary(course, lessonVocabulary(units[0]), now + day), 0);
  assert.ok(words.every(word => course.cards[word.id].due === now + day), 're-entering a lesson cannot postpone reviews');
  course.journey = { level: 8, evidence: {}, recent: {}, lastActivity: null };
  assert.equal(reviewQueue(course, false, now).filter(entry => entry.id.startsWith('word-')).length, 0);
  assert.equal(reviewQueue(course, false, now + day).filter(entry => entry.id.startsWith('word-')).length, 359);
});

test('F04 every review score comes from answered questions, never a self-rating', () => {
  const current = newCourse();
  const now = 1_700_000_000_000;
  const word = words[0];
  introduceVocabulary(current, [word], now);
  // Merely saving or presenting a word never increments objective attempts.
  assert.equal(vocabularyCoverage(current, [word], now).tested, 0);
  recordPractice(current, [{ id: word.id, correct: true, scored: true, skill: 'recognition' }], now + 100);
  assert.equal(vocabularyCoverage(current, [word], now).tested, 1);
  for (const direction of ['forward', 'reverse']) for (const format of ['choice', 'match']) {
    recordObjectiveVocabularyReview(current, [{ id: word.id, direction, format, correct: true }], now + day);
  }
  assert.equal(vocabularyCoverage(current, [word], now + day).bidirectional, 1);
  assert.equal(current.vocabProgress[word.id].correct, 5);
  assert.equal(current.vocabProgress[word.id].recallAttempts, undefined);
  assert.equal(current.vocabProgress[word.id].reviewEvidence.forwardChoice.correct, 1);
  const state = validateState({ base: 'uz', target: 'tr', courses: { 'uz>tr': current } });
  assert.deepEqual(state.courses['uz>tr'].vocabProgress, current.vocabProgress);
  assert.equal(state.courses['uz>tr'].reviewAssessmentVersion, 2);
  assert.throws(() => validateState({ base: 'uz', target: 'tr', courses: { 'uz>tr': {
    ...current,
    vocabProgress: { [word.id]: { ...current.vocabProgress[word.id],
      reviewEvidence: { forwardChoice: { attempts: 1, correct: 2 } } } }
  } }));
});

test('all 64 lessons across 30 language directions preview all six phrases without a hidden subscore', () => {
  assert.equal(phrases.length, 384);
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const unit of units) {
      const tasks = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
      assert.equal(lessonQuestionTotal(tasks), 8, unit.id + ' ' + base + '>' + target);
      assert.equal(tasks[0].task, 'intro');
      assert.deepEqual(tasks[0].examples.map(entry => entry.id), unit.phrases.map(entry => entry.id));
      assert.equal(tasks.some(task => task.firstEncounter), false);
      assert.equal(tasks.filter(task => task.task === 'write').length, 1);
      assert.equal(tasks.filter(task => task.task === 'dictation').length, 1);
      assert.ok(tasks.filter(task => ['write', 'dictation'].includes(task.task))
        .every(task => task.core && task.wordBank.expected.length > 1));
      const answers = tasks.map(task => ({ correct: Boolean(task.core) }));
      assert.deepEqual(lessonScore(tasks, answers), { correct: 8, total: 8, passed: true });
      const firstGraded = tasks.findIndex(task => task.core);
      answers[firstGraded].correct = false;
      assert.deepEqual(lessonScore(tasks, answers), { correct: 7, total: 8, passed: true });
    }
  }
});

test('F06 extended Level 6–8 readings progress in depth with inference and evidence checks', () => {
  const expected = new Map([[6, 140], [7, 160], [8, 200]]);
  assert.equal(stories.length, 31);
  assert.equal(extendedStories.length, 3);
  for (const story of extendedStories) {
    assert.equal(story.kind, 'extended');
    const wordsEn = story.lines.flatMap(line => line.text.en.trim().split(/\s+/)).length;
    assert.ok(wordsEn >= expected.get(story.level), story.id + ' ' + wordsEn);
    assert.equal(story.questions.length, 5);
    assert.equal(storyPassed(story, 3), false);
    assert.equal(storyPassed(story, 4), true);
    assert.ok(story.questions.filter(q => ['inference', 'evidence', 'analysis', 'evaluation', 'synthesis', 'application'].includes(q.kind)).length >= 2);
    for (const line of story.lines) {
      assert.ok(readingAid(line, 'ar'), line.id + ': Arabic reading aid');
      for (const code of codes) assert.ok(line.text[code]?.trim(), line.id + ' ' + code);
    }
    for (const base of codes) {
      const tasks = readingQuestions(story, base, () => 0.37);
      assert.equal(tasks.length, 5);
      assert.deepEqual(tasks.map(q => q.thinking), story.questions.map(q => q.kind));
      for (const task of tasks) {
        assert.equal(task.options.length, 3);
        assert.ok(task.options.includes(task.entry));
      }
    }
  }
});

test('F04–F06 learner-facing copy is present in every supported interface language', () => {
  for (const code of codes) {
    for (const key of ['vocabularyExposureStats','readingDepthResult','lessonFlowIntroLead']) {
      assert.ok(copy[code][key]?.trim(), code + ' ' + key);
    }
    // These implementation details must not leak back onto the lesson result.
    assert.equal(copy[code].passLead, undefined);
    assert.equal(copy[code].lessonFirstEncounterResult, undefined);
  }
});
