import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units, phrases } from '../dist/content.mjs';
import { wordGroups, words } from '../dist/words.mjs';
import { stories } from '../dist/stories.mjs';
import { path, journeyFor, accessibleLevel, lessonUnlocked, checkpointUnlocked, levelComplete, applyPlacement, nextActivity } from '../dist/journey.mjs';
import { checkpointQuestions, placementQuestions, practiceQuestions, mixedQuestions, matchRound } from '../dist/practice.mjs';
import { newCourse, recordPractice, reviewQueue } from '../dist/engine.mjs';
import { vocabularyEntries, vocabularyReviewSummary } from '../dist/vocabulary.mjs';
import { validateState } from '../dist/progress-data.mjs';

const passLesson = (course, unit) => { course.best[unit.id] = 4; };
const wordCatalog = wordGroups.map(group => ({ ...group, entries: group.words }));
const phraseCatalog = units.map(unit => ({ ...unit, entries: unit.phrases }));
const allEntries = [...words, ...phrases];

test('every content item has one explicit canonical level, with the complete catalog partitioned exactly once', () => {
  assert.equal(path.length, 8);
  assert.equal(units.length, 56);
  assert.equal(phrases.length, 336);
  assert.equal(words.length, 336);
  assert.equal(stories.length, 26);
  assert.ok([...units, ...wordGroups, ...stories, ...allEntries].every(item => Number.isInteger(item.level) && item.level >= 1 && item.level <= 8));
  for (const step of path) {
    assert.equal(step.units.length, 7);
    assert.ok(step.units.every(unit => unit.level === step.level));
    assert.ok(step.wordGroups.every(group => group.level === step.level && group.words.every(word => word.level === step.level)));
    assert.ok(step.stories.every(story => story.level === step.level));
    assert.ok(step.phrases.every(phrase => phrase.level === step.level));
  }
  for (const [catalog, group] of [[units, 'units'], [wordGroups, 'wordGroups'], [stories, 'stories']]) {
    assert.deepEqual(new Set(path.flatMap(step => step[group])), new Set(catalog));
  }
});

test('the next lesson unlocks sequentially; seven completed lessons and a passed checkpoint are both mandatory', () => {
  const course = newCourse();
  assert.equal(accessibleLevel(course), 1);
  assert.equal(lessonUnlocked(course, path[0].units[0]), true);
  assert.equal(lessonUnlocked(course, path[0].units[1]), false);
  assert.equal(checkpointUnlocked(course, 1), false);
  assert.equal(lessonUnlocked(course, path[1].units[0]), false);
  for (const [index, unit] of path[0].units.entries()) {
    assert.equal(lessonUnlocked(course, unit), true, 'lesson ' + (index + 1));
    passLesson(course, unit);
  }
  assert.equal(checkpointUnlocked(course, 1), true);
  assert.equal(nextActivity(course).type, 'checkpoint');
  assert.equal(accessibleLevel(course), 1);
  course.practiceBest = { 'checkpoint-1': 7 };
  assert.equal(accessibleLevel(course), 1);
  course.practiceBest['checkpoint-1'] = 8;
  assert.equal(levelComplete(course, 1), true);
  assert.equal(accessibleLevel(course), 2);
  assert.equal(lessonUnlocked(course, path[2].units[0]), false);
});

test('checkpoints passed before finishing lessons never bypass the lesson requirement', () => {
  const course = newCourse();
  course.practiceBest = { 'checkpoint-1': 12 };
  assert.equal(accessibleLevel(course), 1);
  assert.equal(checkpointUnlocked(course, 1), false);
  for (const unit of path[0].units) passLesson(course, unit);
  assert.equal(accessibleLevel(course), 2);
});

test('all eight levels unlock in order and the final checkpoint completes the learning path', () => {
  const course = newCourse();
  for (const step of path) {
    assert.equal(accessibleLevel(course), step.level);
    for (const unit of step.units) passLesson(course, unit);
    assert.equal(accessibleLevel(course), step.level);
    course.practiceBest ??= {};
    course.practiceBest['checkpoint-' + step.level] = 8;
    assert.equal(levelComplete(course, step.level), true);
    assert.equal(accessibleLevel(course), Math.min(8, step.level + 1));
  }
  assert.equal(journeyFor(course).level, 8);
});

test('placement samples all eight levels and never needs older levels to be completed', () => {
  const placement = placementQuestions('uz', 'tr', () => 0.36);
  assert.equal(placement.length, 16);
  for (const step of path) {
    assert.equal(placement.filter(q => (q.studyEntry ?? q.entry).level === step.level).length, 2);
  }
  const course = newCourse();
  const answers = Array.from({ length: 16 }, (_, index) => ({ correct: index < 6 }));
  assert.equal(applyPlacement(course, answers), 4);
  assert.equal(accessibleLevel(course), 4);
  assert.equal(course.placementDone, true);
  assert.equal(lessonUnlocked(course, path[2].units[6]), true, 'placed learner can revisit lower levels');
  assert.equal(lessonUnlocked(course, path[3].units[1]), false, 'current level stays sequential');
  assert.equal(lessonUnlocked(course, path[4].units[0]), false, 'higher level stays locked');
  const restored = validateState({ base: 'uz', target: 'tr', courses: { 'uz>tr': course } });
  assert.equal(restored.courses['uz>tr'].placementDone, true);
  assert.equal(accessibleLevel(restored.courses['uz>tr']), 4);
});

test('vocabulary and phrasebook only include unlocked material in every language direction', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    const course = newCourse();
    for (const [groups, expected] of [[wordCatalog, words], [phraseCatalog, phrases]]) {
      const visible = vocabularyEntries(groups, course, { base, target });
      assert.equal(visible.length, expected.filter(item => item.level === 1).length);
      assert.ok(visible.every(row => row.entry.level === 1));
    }
    const future = words.find(word => word.level === 8);
    const futurePhrase = phrases.find(phrase => phrase.level === 8);
    course.cards[future.id] = { step: -1, due: 1000 };
    course.cards[futurePhrase.id] = { step: -1, due: 1000 };
    assert.equal(vocabularyEntries(wordCatalog, course, { base, target, filter: 'due' }, 2000).length, 0);
    assert.equal(vocabularyReviewSummary(course, 2000).ready, 0);
    assert.equal(reviewQueue(course, false, 2000).length, 0);
  }
});

test('practice, mixed quizzes, matching and checkpoints stay within unlocked levels', () => {
  for (const level of [1, 3, 8]) {
    const course = newCourse();
    course.journey = { level, evidence: {}, recent: {}, lastActivity: null };
    for (const base of codes) for (const target of codes.filter(code => code !== base)) {
      for (const mode of ['translation', 'words', 'gap', 'order', 'listen', 'spelling']) {
        const questions = practiceQuestions(mode, course, base, target, () => 0.39);
        assert.equal(questions.length, 6);
        assert.ok(questions.every(q => (q.studyEntry ?? q.entry).level <= level), mode + ' future-level leak');
      }
      assert.ok(mixedQuestions(course, base, target, () => 0.39).every(q => (q.studyEntry ?? q.entry).level <= level));
      assert.ok(matchRound(course, () => 0.39).baseCards.every(card => card.level <= level));
      assert.equal(checkpointQuestions(level, base, target, () => 0.39).length, 12);
    }
  }
});
