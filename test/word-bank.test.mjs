import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { newCourse } from '../dist/engine.mjs';
import { buildLessonActivities } from '../dist/lesson-flow.mjs';
import { createSkillRound } from '../dist/skill-lab.mjs';
import { makeWordBank, wordBankMatches, wordBankSelection, tileWords, extraTileCount } from '../dist/word-bank.mjs';
import { alternativeOrders } from '../dist/word-orders.mjs';
import { phrases } from '../dist/content.mjs';

test('a three-word sentence uses individual tappable tiles instead of typed input', () => {
  const bank = makeWordBank({ text: { tr: 'Benim adım Ali.' } }, 'tr', () => 0.39);
  // The first word is shown in lower case so its capital letter does not give the order away.
  assert.deepEqual(bank.expected.map(tile => tile.text), ['benim', 'adım', 'Ali']);
  assert.equal(new Set(bank.tray.map(tile => tile.id)).size, 3);
  assert.notDeepEqual(bank.tray.map(tile => tile.id), bank.expected.map(tile => tile.id));
  assert.equal(wordBankMatches(bank, ['0','1','2']), true);
  assert.equal(wordBankMatches(bank, ['1','0','2']), false);
  assert.equal(wordBankMatches(bank, ['0','1']), false);
  assert.deepEqual(wordBankSelection(bank, ['2','0']).map(tile => tile.text), ['Ali', 'benim']);
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
        const trayIds = task.wordBank.tray.map(tile => tile.id);
        assert.equal(new Set(trayIds).size, trayIds.length);
        assert.ok(expectedIds.every(id => trayIds.includes(id)));
        assert.equal(trayIds.length, expectedIds.length + extraTileCount, unit.id + ' ' + target + ' extra tiles');
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
      assert.equal(dictation.wordBank.tray.length, tiles.length + extraTileCount);
      assert.equal(new Set(dictation.wordBank.tray.map(tile => tile.id)).size, tiles.length + extraTileCount);
      assert.equal(dictation.core, true, 'listening dictation counts toward the lesson score');
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
          assert.equal(task.wordBank.tray.length, task.wordBank.expected.length + extraTileCount);
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

test('extra tiles must be left out, and the answer length is not given away', () => {
  const unit = units.find(item => item.id === 'routine');
  const bank = makeWordBank(unit.phrases[4], 'en', () => 0.3, unit.phrases);
  const expected = bank.expected.map(tile => tile.id);
  const extras = bank.tray.filter(tile => !expected.includes(tile.id));
  assert.equal(extras.length, extraTileCount);
  const needed = new Set(bank.expected.map(tile => tile.text.toLowerCase()));
  assert.ok(extras.every(tile => !needed.has(tile.text.toLowerCase())), 'extra tiles never repeat a needed word');
  assert.equal(wordBankMatches(bank, expected), true);
  assert.equal(wordBankMatches(bank, [...expected, extras[0].id]), false);
  assert.equal(wordBankMatches(bank, [extras[0].id, ...expected.slice(1)]), false);
});

test('tiles carry no punctuation or sentence-initial capital that reveals the order', () => {
  const allowed = { en: /^(I|I[’']\p{L}+|Wednesday)$/u, de: /^(Sie|Entschuldigung|Mittwoch)$/u, uz: /^Mira$/u, tr: /^Mira$/u };
  for (const entry of phrases) for (const code of codes) {
    const words = tileWords(entry.text[code], code);
    assert.ok(words.every(word => !/[.,!?;:،؟…—]$/u.test(word) && /[\p{L}\p{N}]/u.test(word)), entry.id + ' ' + code + ': ' + words);
    if (/^\p{Lu}/u.test(words[0])) assert.match(words[0], allowed[code] ?? /^$/, entry.id + ' ' + code);
  }
});

test('valid alternative word orders are accepted for lesson sentences', () => {
  const byId = new Map(phrases.map(entry => [entry.id, entry]));
  let count = 0;
  for (const [id, languages] of Object.entries(alternativeOrders)) {
    const entry = byId.get(id);
    assert.ok(entry, id + ' is not a lesson phrase');
    for (const [code, orders] of Object.entries(languages)) {
      assert.ok(codes.includes(code), id + ' ' + code);
      const bank = makeWordBank(entry, code, () => 0.4);
      assert.equal(bank.alternatives.length, orders.length, id + ' ' + code + ' alternative uses different words');
      for (const order of bank.alternatives) {
        assert.notDeepEqual(order, bank.expected.map(tile => tile.text), id + ' ' + code + ' repeats the reference');
        // Rebuild the alternative from tile IDs, using each tile once.
        const remaining = [...bank.expected];
        const ids = order.map(text => remaining.splice(remaining.findIndex(tile => tile.text === text), 1)[0].id);
        assert.equal(wordBankMatches(bank, ids), true, id + ' ' + code);
        count++;
      }
    }
  }
  assert.ok(count >= 100);
  const german = makeWordBank(byId.get('family-6'), 'de', () => 0.4);
  assert.equal(wordBankMatches(german, ['0', '1', '4', '2', '3']), true, 'Ich besuche oft meine Eltern');
  assert.equal(wordBankMatches(german, ['1', '0', '2', '3', '4']), false, 'a wrong order is still marked wrong');
});
