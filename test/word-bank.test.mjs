import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units } from '../dist/content.mjs';
import { newCourse } from '../dist/engine.mjs';
import { buildLessonActivities } from '../dist/lesson-flow.mjs';
import { createSkillRound } from '../dist/skill-lab.mjs';
import { makeWordBank, wordBankMatches, wordBankSelection, tileWords, extraTileCount } from '../dist/word-bank.mjs';
import { alternativeOrders } from '../dist/word-orders.mjs';
import { applySpeakerForms, speakerForms } from '../dist/speaker-forms.mjs';
import { phrases } from '../dist/content.mjs';
import { readingAid, aidWords, readingAidText, romanizeRussian } from '../dist/reading-aid.mjs';
import { practiceQuestion, gapCandidates } from '../dist/practice.mjs';
import { markRussianStress } from '../dist/russian-stress.mjs';

test('the Russian reading aid is produced for every phrase, word and tile', () => {
  const samples = [
    ['Здравствуйте!', 'Zdravstvuyte!'],
    ['Как у вас дела?', 'Kak u vas dela?'],
    ['Доброе утро!', 'Dobroye utro!'],
    ['Я учу новый язык.', 'Ya uchu novyy yazyk.'],
    ['Приятно познакомиться.', 'Priyatno poznakomit\u2019sya.'],
    ['Ещё раз, пожалуйста.', 'Yeshcho raz, pozhaluysta.'],
    ['Мой друг живёт неподалёку.', 'Moy drug zhivyot nepodalyoku.'],
    ['Объявление', 'Obyavleniye']
  ];
  for (const [cyrillic, latin] of samples) assert.equal(romanizeRussian(cyrillic), latin);
  assert.equal(romanizeRussian(''), '');
  assert.equal(romanizeRussian(undefined), '');
  assert.equal(readingAidText({ text: { en: 'Hello' } }, 'en'), '', 'only Arabic and Russian need an aid');

  for (const unit of units) for (const entry of unit.phrases) {
    const aid = readingAid(entry, 'ru');
    assert.ok(aid, entry.id + ' has no Russian reading aid');
    assert.equal(aid.length, aidWords(entry.text.ru).length);
    assert.ok(aid.every(word => word.trim() && !/[\u0400-\u04FF]/.test(word)),
      entry.id + ': Cyrillic left in the aid ' + aid.join(' '));
    const bank = makeWordBank(entry, 'ru', () => 0.31, unit.phrases);
    for (const token of bank.tray) assert.ok(token.roman?.trim(), entry.id + ': tile "' + token.text + '" has no aid');
  }
});

test('Russian reading aids distinguish contextual stress and preserve it on tiles', () => {
  const price = phrases.find(entry => entry.id === 'cafe-3');
  const location = phrases.find(entry => entry.id === 'where-things-are-4');
  assert.match(readingAidText(price, 'ru'), /sto\u0301it/u);
  assert.match(readingAidText(location, 'ru'), /stoi\u0301t/u);
  assert.equal(makeWordBank(price, 'ru').expected.find(tile => tile.text === 'стоит').roman, 'sto\u0301it');
  assert.equal(makeWordBank(location, 'ru').expected.find(tile => tile.text === 'стоит').roman, 'stoi\u0301t');
  assert.ok(location.text.ru.includes('стоит'));
});

test('every Arabic word tile and gap option carries its own reading aid', () => {
  for (const base of codes.filter(code => code !== 'ar')) {
    for (const unit of units) {
      for (const entry of unit.phrases) {
        const aid = readingAid(entry, 'ar');
        assert.ok(aid, entry.id + ' has no aligned reading aid');
        assert.equal(aid.length, aidWords(entry.text.ar).length);
        const bank = makeWordBank(entry, 'ar', () => 0.41, unit.phrases);
        for (const token of bank.tray) {
          assert.ok(token.roman?.trim(), entry.id + ': tile "' + token.text + '" has no reading aid');
        }
      }
      const gap = practiceQuestion('gap', gapCandidates(unit.phrases, 'ar')[0], 0, base, 'ar', () => 0.23);
      for (const choice of gap.options) {
        assert.ok(choice.romanization?.trim(), unit.id + ': gap option "' + choice.text.ar + '" has no reading aid');
      }
    }
  }
  // An entry whose aid cannot be matched word for word shows none at all.
  assert.equal(readingAid({ text: { ar: 'كلمة واحدة' }, romanization: 'kalima' }, 'ar'), null);
  assert.equal(readingAid({ text: { en: 'two words' }, romanization: 'x y' }, 'en'), null);
});

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

test('all 64 lessons and all 30 directions offer complete ordered writing tiles', () => {
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
      // Gender-specific alternatives apply to the matching speaker form only.
      const accepted = [];
      for (const form of speakerForms) {
        applySpeakerForms(form);
        const bank = makeWordBank(entry, code, () => 0.4);
        for (const order of bank.alternatives) {
          assert.notDeepEqual(order, bank.expected.map(tile => tile.text), id + ' ' + code + ' repeats the reference');
          // Rebuild the alternative from tile IDs, using each tile once.
          const remaining = [...bank.expected];
          const ids = order.map(text => remaining.splice(remaining.findIndex(tile => tile.text === text), 1)[0].id);
          assert.equal(wordBankMatches(bank, ids), true, id + ' ' + code);
          accepted.push(order.join(' '));
          count++;
        }
      }
      applySpeakerForms('m');
      for (const order of orders) assert.ok(accepted.includes(tileWords(order, code).join(' ')), id + ' ' + code + ': ' + order + ' uses different words');
    }
  }
  assert.ok(count >= 100);
  const german = makeWordBank(byId.get('family-6'), 'de', () => 0.4);
  assert.equal(wordBankMatches(german, ['0', '1', '4', '2', '3']), true, 'Ich besuche oft meine Eltern');
  assert.equal(wordBankMatches(german, ['1', '0', '2', '3', '4']), false, 'a wrong order is still marked wrong');
});

test('meaning-based dictation accepts reviewed word orders for both Russian speaker forms', () => {
  const unit = units.find(item => item.id === 'wellbeing');
  try {
    for (const [form, verb] of [['m', 'хотел'], ['f', 'хотела']]) {
      applySpeakerForms(form);
      const tasks = buildLessonActivities(unit, newCourse(), 'uz', 'ru', () => 0.3);
      const { entry, wordBank } = tasks.find(task => task.task === 'dictation');
      assert.equal(entry.id, 'wellbeing-6');
      const order = ['я', 'бы', verb, 'немного', 'отдохнуть'];
      const answer = order.map(word => wordBank.expected.find(tile => tile.text === word).id);
      assert.equal(wordBankMatches(wordBank, answer), true);
      assert.equal(wordBankMatches(wordBank, answer, { allowAlternatives: false }), false);
    }
  } finally {
    applySpeakerForms('m');
  }
});

test('Russian stress covers corrected words, hyphenated forms, and contextual homographs', () => {
  assert.equal(markRussianStress('Пока я ждал, начался дождь.', 'story-2'), 'Пока́ я ждал, начался́ дождь.');
  assert.equal(markRussianStress('Малика и Малики', 'story-leaking-tap-1'), 'Мали́ка и Мали́ки');
  assert.equal(markRussianStress('Они добрались домой раньше, чем ожидали.', 'story-route-home-5'), 'Они́ добрали́сь домо́й ра́ньше, чем ожида́ли.');
  assert.equal(markRussianStress('например', 'word-connectors-2'), 'наприме́р');
  assert.equal(markRussianStress('По-моему, из-за дождя кто-то или что-то кому-либо.'), 'По-мо́ему, и́з-за дождя́ кто́-то и́ли что́-то кому́-либо.');
  assert.equal(markRussianStress('Не могли бы вы проверить мою бронь?', 'problems-3'), 'Не могли́ бы вы прове́рить мою́ бронь?');
  assert.equal(markRussianStress('Я мою посуду каждый день.', 'home-chores-1'), 'Я мо́ю посу́ду ка́ждый день.');
  assert.equal(markRussianStress('До которого часа нужно освободить номер?', 'hotel-3'), 'До кото́рого ча́са ну́жно освободи́ть но́мер?');
  assert.equal(markRussianStress('Сейчас три часа.', 'telling-time-1'), 'Сейча́с три часа́.');
  assert.equal(markRussianStress('Для меня надёжность важнее цены.', 'compare-3'), 'Для меня́ надё́жность важне́е цены́.');
  assert.equal(markRussianStress('Посидим немного в тени?', 'outdoors-4'), 'Посиди́м немно́го в тени́?');
});

test('German word-bank tiles lowercase third-person Sie at sentence start while keeping formal Sie capitalized', () => {
  assert.equal(tileWords('Sie ist gerade nicht an ihrem Platz.', 'de')[0], 'sie');
  assert.equal(tileWords('Sie hilft immer anderen.', 'de')[0], 'sie');
  assert.equal(tileWords('Sie können mit Karte bezahlen.', 'de')[0], 'Sie');
  assert.equal(tileWords('Sie sind bereit.', 'de')[0], 'Sie');
});

