import test from 'node:test';
import assert from 'node:assert/strict';
import { path, lessonVocabulary } from '../dist/journey.mjs';
import { lessonTopics, lessonWordGroups } from '../dist/lesson-words.mjs';
import { words } from '../dist/words.mjs';
import { codes } from '../dist/content.mjs';
import { searchText } from '../dist/engine.mjs';

test('every lesson teaches the word groups of its own topic, and every group belongs to one lesson', () => {
  for (const step of path) {
    const assigned = [];
    for (const unit of step.units) {
      const ids = lessonTopics[unit.id];
      assert.ok(ids?.length, unit.id + ' has no word groups');
      for (const id of ids) assert.ok(step.wordGroups.some(group => group.id === id), unit.id + ': ' + id + ' is not a Level ' + step.level + ' group');
      assert.deepEqual(lessonVocabulary(unit), ids.flatMap(id => step.wordGroups.find(group => group.id === id).words));
      assigned.push(...ids);
    }
    assert.deepEqual([...assigned].sort(), step.wordGroups.map(group => group.id).sort(), 'Level ' + step.level + ' groups are each taught once');
  }
  // No topic map entry points at a lesson that does not exist.
  const units = new Set(path.flatMap(step => step.units.map(unit => unit.id)));
  for (const id of Object.keys(lessonTopics)) assert.ok(units.has(id), id);
});

test('new topic words are new: no other word has the same text in any language', () => {
  const added = new Set(lessonWordGroups.flatMap(group => group.words));
  const others = words.filter(word => !added.has(word));
  for (const code of codes) {
    const existing = new Set(others.map(word => searchText(word.text[code])));
    const seen = new Set();
    for (const word of added) {
      const key = searchText(word.text[code]);
      assert.ok(!existing.has(key), code + ': "' + word.text[code] + '" (' + word.text.en + ') already exists');
      assert.ok(!seen.has(key), code + ': "' + word.text[code] + '" is added twice');
      seen.add(key);
    }
  }
});

test('Lug‘at reveals a level lesson by lesson', async () => {
  const { entryRevealed } = await import('../dist/journey.mjs');
  const { newCourse } = await import('../dist/engine.mjs');
  const level1 = path[0];
  const [first, second] = level1.units;
  const course = newCourse();
  const shown = unit => [...lessonVocabulary(unit), ...unit.phrases].filter(entry => entryRevealed(course, entry));
  // A new learner sees nothing yet, and nothing from a later level.
  assert.equal(level1.units.flatMap(shown).length, 0);
  assert.ok(!entryRevealed(course, lessonVocabulary(path[1].units[0])[0]));
  // Finishing a lesson reveals its words and phrases, and only those.
  course.best[first.id] = 100;
  assert.equal(shown(first).length, lessonVocabulary(first).length + first.phrases.length);
  assert.equal(shown(second).length, 0);
  // A word met on its card, or saved for review, stays visible before the lesson is passed.
  const [met, saved] = lessonVocabulary(second);
  course.vocabProgress = { [met.id]: { introducedAt: 1, attempts: 0, correct: 0, lastAttemptAt: 0, reviewEvidence: {} } };
  course.cards[saved.id] = { step: 0, due: 1 };
  assert.deepEqual(shown(second).map(entry => entry.id), [met.id, saved.id]);
  // Placed into Level 3: Levels 1 and 2 are open in full, Level 3 starts lesson by lesson.
  const placed = newCourse();
  placed.journey = { level: 3, evidence: {}, recent: {}, lastActivity: null };
  assert.ok(path.slice(0, 2).every(step => step.units.every(unit =>
    [...lessonVocabulary(unit), ...unit.phrases].every(entry => entryRevealed(placed, entry)))));
  assert.ok(path[2].units.every(unit => lessonVocabulary(unit).every(entry => !entryRevealed(placed, entry))));
});
