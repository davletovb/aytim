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
