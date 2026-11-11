import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units, phrases } from '../dist/content.mjs';
import { wordGroups, words } from '../dist/words.mjs';
import { stories } from '../dist/stories.mjs';
import { path, journeyFor, journeyStatus, accessibleLevel, lessonUnlocked, checkpointUnlocked, levelComplete, applyPlacement, nextActivity, checkpointPassMark } from '../dist/journey.mjs';
import { checkpointQuestions, placementQuestions, practiceQuestions, mixedQuestions, matchRound } from '../dist/practice.mjs';
import { newCourse, recordPractice, reviewQueue } from '../dist/engine.mjs';
import { vocabularyEntries, vocabularyReviewSummary } from '../dist/vocabulary.mjs';
import { validateState } from '../dist/progress-data.mjs';

const passLesson = (course, unit) => { course.best[unit.id] = 88; };
const wordCatalog = wordGroups.map(group => ({ ...group, entries: group.words }));
const phraseCatalog = units.map(unit => ({ ...unit, entries: unit.phrases }));
const allEntries = [...words, ...phrases];

test('every content item has one explicit canonical level, with the complete catalog partitioned exactly once', () => {
  assert.equal(path.length, 8);
  assert.equal(units.length, 56);
  assert.equal(phrases.length, 336);
  assert.equal(words.length, 356);
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

test('lessons stay sequential but the level test is immediately accessible', () => {
  const course = newCourse();
  assert.equal(accessibleLevel(course), 1);
  assert.equal(lessonUnlocked(course, path[0].units[0]), true);
  assert.equal(lessonUnlocked(course, path[0].units[1]), false);
  assert.equal(checkpointUnlocked(course, 1), true);
  assert.equal(lessonUnlocked(course, path[1].units[0]), false);
  for (const [index, unit] of path[0].units.entries()) {
    assert.equal(lessonUnlocked(course, unit), true, 'lesson ' + (index + 1));
    passLesson(course, unit);
  }
  assert.equal(checkpointUnlocked(course, 1), true);
  assert.equal(nextActivity(course).type, 'checkpoint');
  assert.equal(accessibleLevel(course), 1);
  course.practiceBest = { 'checkpoint-1': checkpointPassMark - 1 };
  assert.equal(accessibleLevel(course), 1);
  course.practiceBest['checkpoint-1'] = checkpointPassMark;
  assert.equal(levelComplete(course, 1), true);
  assert.equal(accessibleLevel(course), 2);
  assert.equal(lessonUnlocked(course, path[2].units[0]), false);
});

test('a directly passed checkpoint unlocks the next level without fabricating completed lessons', () => {
  const course = newCourse();
  assert.equal(checkpointUnlocked(course, 1), true);
  assert.equal(checkpointUnlocked(course, 2), false);
  course.practiceBest = { 'checkpoint-1': 12 };
  assert.equal(levelComplete(course, 1), true);
  assert.equal(accessibleLevel(course), 2);
  assert.equal(journeyFor(course).level, 2);
  assert.deepEqual(course.best, {}, 'skipped lesson scores remain untouched');
  assert.equal(lessonUnlocked(course, path[0].units[6]), true, 'lower levels can be revisited');
  assert.equal(lessonUnlocked(course, path[1].units[0]), true);
  assert.equal(lessonUnlocked(course, path[1].units[1]), false, 'new-level lessons still unlock sequentially');
  assert.equal(checkpointUnlocked(course, 2), true, 'next level test can also be taken immediately');
  assert.equal(checkpointUnlocked(course, 3), false, 'higher-level test remains locked');
  assert.equal(nextActivity(course).unit?.level, 2);
});

test('a failed direct checkpoint does not grant higher-level access', () => {
  const course = newCourse();
  course.practiceBest = { 'checkpoint-1': checkpointPassMark - 1 };
  assert.equal(accessibleLevel(course), 1);
  assert.equal(levelComplete(course, 1), false);
  assert.equal(checkpointUnlocked(course, 2), false);
  assert.equal(lessonUnlocked(course, path[1].units[0]), false);
  course.practiceBest['checkpoint-1'] = checkpointPassMark;
  assert.equal(accessibleLevel(course), 2);
});

test('checkpoint-only progression works through Level 8 and finishes the path', () => {
  const course = newCourse();
  for (const step of path) {
    assert.equal(accessibleLevel(course), step.level);
    assert.equal(checkpointUnlocked(course, step.level), true);
    course.practiceBest ??= {};
    course.practiceBest['checkpoint-' + step.level] = checkpointPassMark;
    assert.equal(accessibleLevel(course), Math.min(8, step.level + 1));
  }
  assert.equal(journeyFor(course).level, 8);
  assert.equal(journeyStatus(course).complete, true, 'the final passed checkpoint completes the path');
  assert.equal(journeyStatus(course).fill, 1);
  assert.deepEqual(course.best, {}, 'none of the lessons need to be marked as passed');
});


test('all eight levels unlock in order and the final checkpoint completes the learning path', () => {
  const course = newCourse();
  for (const step of path) {
    assert.equal(accessibleLevel(course), step.level);
    for (const unit of step.units) passLesson(course, unit);
    assert.equal(accessibleLevel(course), step.level);
    course.practiceBest ??= {};
    course.practiceBest['checkpoint-' + step.level] = checkpointPassMark;
    assert.equal(levelComplete(course, step.level), true);
    assert.equal(accessibleLevel(course), Math.min(8, step.level + 1));
  }
  assert.equal(journeyFor(course).level, 8);
});

test('passing the current checkpoint reveals only the next level\'s vocabulary', () => {
  const course = newCourse();
  const before = vocabularyEntries(wordCatalog, course, { base: 'uz', target: 'tr' });
  assert.ok(before.every(({ entry }) => entry.level === 1));
  course.practiceBest = { 'checkpoint-1': checkpointPassMark };
  const after = vocabularyEntries(wordCatalog, course, { base: 'uz', target: 'tr' });
  assert.equal(after.length, words.filter(word => word.level <= 2).length);
  assert.ok(after.some(({ entry }) => entry.level === 2));
  assert.ok(after.every(({ entry }) => entry.level <= 2));
  for (const mode of ['translation', 'words', 'gap', 'listen']) {
    assert.ok(practiceQuestions(mode, course, 'uz', 'tr').every(q => (q.studyEntry ?? q.entry).level <= 2));
  }
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
  assert.equal(applyPlacement(course, Array.from({ length: 16 }, () => ({ correct: false }))), 4, 'retaking placement must not demote an existing learner');
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
      for (const mode of ['translation', 'words', 'gap', 'listen']) {
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

test('the level test needs 80% like a lesson and includes sentence building', () => {
  assert.equal(checkpointPassMark, 10);
  const course = newCourse();
  course.practiceBest = { 'checkpoint-1': 9 };
  assert.equal(levelComplete(course, 1), false);
  course.practiceBest['checkpoint-1'] = 10;
  assert.equal(levelComplete(course, 1), true);
  for (const step of path) {
    const questions = checkpointQuestions(step.level, 'uz', 'de', () => 0.42);
    const writing = questions.filter(question => question.task === 'write');
    assert.equal(writing.length, 2, 'Level ' + step.level);
    for (const question of writing) {
      assert.deepEqual([question.from, question.to], ['uz', 'de']);
      assert.ok(question.wordBank.expected.length > 1);
    }
    const ids = questions.map(question => (question.studyEntry ?? question.entry).id);
    assert.equal(new Set(ids).size, ids.length, 'no phrase is tested twice');
  }
});

test('placement samples every lesson of a level and forgives one slip', () => {
  const seen = new Set();
  let seed = 1;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  for (let round = 0; round < 60; round++) {
    for (const question of placementQuestions('uz', 'en', random)) seen.add(question.entry.id.replace(/-\d+$/, ''));
  }
  for (const step of path) assert.ok(step.units.every(unit => seen.has(unit.id)), 'Level ' + step.level + ' lessons are all sampled');
  const answers = pattern => [...pattern].map(mark => ({ correct: mark === '1' }));
  assert.equal(applyPlacement(newCourse(), answers('1111111111111111')), 8);
  assert.equal(applyPlacement(newCourse(), answers('1110111100000000')), 5, 'a slip at Level 2 is forgiven by a perfect Level 3');
  assert.equal(applyPlacement(newCourse(), answers('1110101100000000')), 2, 'a second miss ends the climb at the slipped level');
  assert.equal(applyPlacement(newCourse(), answers('1011000000000000')), 3, 'a Level 1 slip is forgiven by a perfect Level 2');
  assert.equal(applyPlacement(newCourse(), answers('1010000000000000')), 1, 'a Level 1 slip without a perfect Level 2 starts at Level 1');
  assert.equal(applyPlacement(newCourse(), answers('1100000000000000')), 2);
});
