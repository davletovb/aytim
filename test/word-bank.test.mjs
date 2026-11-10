import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { newCourse } from '../dist/engine.mjs';
import { buildLessonActivities } from '../dist/lesson-flow.mjs';
import { createSkillRound } from '../dist/skill-lab.mjs';
import { makeWordBank, wordBankMatches, wordBankSelection } from '../dist/word-bank.mjs';

test('a three-word sentence uses individual tappable tiles instead of typed input', () => {
  const bank = makeWordBank({ text: { tr: 'Benim adım Ali.' } }, 'tr', () => 0.39);
  assert.deepEqual(bank.expected.map(tile => tile.text), ['Benim', 'adım', 'Ali']);
  assert.equal(new Set(bank.tray.map(tile => tile.id)).size, 3);
  assert.notDeepEqual(bank.tray.map(tile => tile.id), bank.expected.map(tile => tile.id));
  assert.equal(wordBankMatches(bank, ['0','1','2']), true);
  assert.equal(wordBankMatches(bank, ['1','0','2']), false);
  assert.equal(wordBankMatches(bank, ['0','1']), false);
  assert.deepEqual(wordBankSelection(bank, ['2','0']).map(tile => tile.text), ['Ali', 'Benim']);
});

test('identical repeated words retain unique tile IDs but interchangeable wording', () => {
  const bank = makeWordBank({ text: { en: 'no no yes' } }, 'en', () => 0.19);
  assert.deepEqual(bank.expected.map(tile => tile.text), ['no','no','yes']);
  assert.deepEqual(bank.expected.map(tile => tile.id), ['0','1','2']);
  assert.equal(wordBankMatches(bank, ['1','0','2']), true);
  assert.equal(wordBankMatches(bank, ['1','2','0']), false);
  assert.equal(wordBankMatches(bank, ['0','0','2']), false);
  assert.equal(wordBankMatches(bank, ['0','1','unknown']), false);
});

test('Arabic and punctuation remain legible while the original source stays intact', () => {
  const arabic = { text: { ar: 'اسمي علي.' } };
  const bank = makeWordBank(arabic, 'ar', () => 0.5);
  assert.equal(arabic.text.ar, 'اسمي علي.');
  assert.deepEqual(bank.expected.map(tile => tile.text), ['اسمي', 'علي']);
  assert.equal(wordBankMatches(bank, ['0','1']), true);
  assert.throws(() => makeWordBank({ text: { de: '' } }, 'de'));
});

test('all 56 lessons and all 30 directions offer complete ordered writing tiles', () => {
  for (const base of codes) for (const target of codes.filter(lang => lang !== base)) {
    for (const unit of units) {
      const round = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
      const writing = round.filter(task => task.task === 'write');
      assert.equal(writing.length, 1);
      for (const task of writing) {
        assert.equal(task.openEnded, false);
        assert.ok(task.wordBank);
        const expectedIds = task.wordBank.expected.map(tile => tile.id);
        assert.equal(wordBankMatches(task.wordBank, expectedIds), true, unit.id + ' ' + target);
        assert.equal(new Set(task.wordBank.tray.map(tile => tile.id)).size, expectedIds.length);
        assert.equal(task.wordBank.tray.length, expectedIds.length);
      }
    }
  }
});

test('all mixed-lesson listening dictations are word-bank tasks across languages', () => {
  for (const base of codes) for (const target of codes.filter(lang => lang !== base)) {
    for (const unit of units) {
      const tasks = buildLessonActivities(unit, newCourse(), base, target, () => 0.37);
      const dictation = tasks.find(task => task.task === 'dictation');
      assert.ok(dictation?.wordBank, unit.id + ' ' + target);
      const tiles = dictation.wordBank.expected;
      assert.equal(wordBankMatches(dictation.wordBank, tiles.map(tile => tile.id)), true);
      assert.equal(dictation.wordBank.tray.length, tiles.length);
      assert.equal(new Set(dictation.wordBank.tray.map(tile => tile.id)).size, tiles.length);
      assert.equal(dictation.core, false, 'listening stays formative');
    }
  }
});

test('standalone listening practice and checks use word banks at all unlocked levels', () => {
  for (const level of [1,2,3,4,5,6,7,8]) {
    const current = newCourse();
    current.journey = { level, evidence: {}, recent: {}, lastActivity: null };
    for (const base of codes) for (const target of codes.filter(lang => lang !== base)) {
      for (const assessment of [false, true]) {
        const round = createSkillRound('listening', current, base, target, assessment, () => 0.49);
        assert.equal(round.tasks.length, 5);
        for (const task of round.tasks) {
          assert.ok(task.wordBank);
          assert.equal(wordBankMatches(task.wordBank, task.wordBank.expected.map(tile => tile.id)), true);
          assert.equal(task.wordBank.tray.length, task.wordBank.expected.length);
        }
      }
    }
  }
});

test('standalone writing practice and tests use word banks at every unlocked level', () => {
  for (const level of [1,2,3,4,5,6,7,8]) {
    const current = newCourse();
    current.journey = { level, evidence: {}, recent: {}, lastActivity: null };
    for (const base of codes) for (const target of codes.filter(lang => lang !== base)) {
      for (const assessment of [false, true]) {
        const round = createSkillRound('writing', current, base, target, assessment, () => 0.49);
        assert.equal(round.tasks.length, 5);
        assert.ok(round.tasks.every(task => !task.openEnded && task.wordBank?.expected.length >= 1));
        for (const task of round.tasks) {
          assert.equal(wordBankMatches(task.wordBank, task.wordBank.expected.map(tile => tile.id)), true);
        }
      }
    }
  }
});
