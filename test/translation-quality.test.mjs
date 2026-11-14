import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, phrases, units } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { stories } from '../dist/stories.mjs';
import { lessonExchanges } from '../dist/dialogues.mjs';
import { readingAid } from '../dist/reading-aid.mjs';

// F03: mechanical gates protect multilingual text shapes, scripts, Arabic
// reading-aid alignment and previously confirmed editorial corrections.
// These gates DO NOT establish native-speaker approval or semantic equivalence.
const byId = items => new Map(items.map(item => [item.id, item]));
const lessonPhrases = byId(phrases);
const lexicon = byId(words);
const storyIndex = new Map(stories.map(story => [story.id, story]));
const replyIndex = new Map(units.flatMap(unit =>
  lessonExchanges(unit).filter(({ reply }) => reply.id.startsWith('dialogue-'))
    .map(({ reply }) => [unit.id, reply])));
const languagePattern = { ar: /\p{Script=Arabic}/u, ru: /\p{Script=Cyrillic}/u };
const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]/gu, '');

test('F03 all 9,066 catalog text fields retain translations, correct scripts and punctuation', () => {
  const entries = [
    ...phrases, ...words, ...stories.flatMap(story => story.lines),
    ...[...replyIndex.values()]
  ];
  const answerTexts = stories.flatMap(story => story.questions.flatMap(question =>
    [question.prompt, ...question.choices]));
  assert.equal(phrases.length, 384);
  assert.equal(words.length, 486);
  assert.equal(stories.length, 31);
  assert.equal(entries.length, 1075); // 384 + 486 + 177 + 28 dialogue-only responses
  assert.equal(answerTexts.length, 436); // 109 questions × (prompt + 3 choices)
  assert.equal((entries.length + answerTexts.length) * codes.length, 9066);
  for (const item of [...entries, ...answerTexts]) {
    const text = item.text ?? item;
    for (const code of codes) {
      assert.equal(typeof text[code], 'string', item.id + ' ' + code);
      assert.ok(text[code].trim(), item.id + ' missing ' + code);
      assert.doesNotMatch(text[code], /\uFFFD|\[object Object\]|undefined|TODO|TBD/);
      if (languagePattern[code]) {
        assert.match(text[code], languagePattern[code], item.id + ' wrong script in ' + code);
      }
    }
    if (/[?]$/.test(text.en) || /[?]$/.test(text.uz)) {
      for (const code of codes) {
        assert.match(text[code], /[?؟]$/, item.id + ' question punctuation ' + code);
      }
    }
  }
  for (const entry of entries) {
    assert.ok(entry.id, 'Every lesson, word, story line and custom reply needs a stable ID');
    assert.ok(readingAid(entry, 'ar'), entry.id + ' Arabic reading aid must align');
    assert.doesNotMatch(entry.romanization, /\p{Script=Arabic}/u,
      entry.id + ' Latin reading aid must not contain Arabic letters');
  }
});

test('F03 every story answer is distinct in each of the six languages', () => {
  let count = 0;
  for (const story of stories) {
    for (const question of story.questions) {
      assert.equal(question.choices.length, 3, story.id);
      for (const code of codes) {
        const displayed = question.choices.map(choice => normalize(choice[code]));
        assert.equal(new Set(displayed).size, 3, story.id + ' ambiguous in ' + code);
      }
      count++;
    }
  }
  assert.equal(count, 109);
});

test('F03 lesson and vocabulary translations preserve high-confidence corrected meanings', () => {
  const phrase = id => lessonPhrases.get(id)?.text;
  const word = id => lexicon.get(id)?.text;
  assert.equal(phrase('hotel-3').ar, 'في أيّ ساعة يجب أن أسجّل المغادرة؟');
  assert.equal(phrase('phone-call-2').ar, 'ليست عند مكتبها الآن.');
  assert.equal(phrase('instructions-3').uz, 'Blankani to‘ldirgach, uni shu manzilga yuboring.');
  assert.equal(phrase('instructions-3').ru, 'Заполнив бланк, отправьте его по этому адресу.');
  assert.equal(phrase('airport-help-1').uz, 'Reysimizga qaysi eshikdan chiqamiz?');
  assert.equal(phrase('airport-help-5').uz, 'Bo‘sh o‘rinlari bor keyingi reys qachon uchadi?');
  assert.equal(phrase('formal-requests-5').de, 'Bitte antworten Sie innerhalb von drei Arbeitstagen schriftlich.');
  assert.equal(phrase('apologising-4').ar, 'سأصلح الأمر اليوم.');
  assert.equal(phrase('city-services-2').de, 'Um wie viel Uhr schließen Sie hier?');
  assert.equal(phrase('city-services-5').ru, 'Вход находится с задней стороны здания.');
  assert.equal(word('word-instructions-1').uz, 'blank');
  assert.equal(word('word-instructions-1').ru, 'бланк');
  assert.equal(word('word-city-8').uz, 'avtobus bekati');
  assert.equal(word('word-travel-4').de, 'das Ticket');
  assert.equal(word('word-mood-5').ru, 'хочется пить');
  assert.equal(word('word-repairs-4').uz, 'xarajatlar smetasi');
  assert.equal(word('word-formal-correspondence-7').de, 'der Arbeitstag');
  for (const id of ['hotel-3', 'phone-call-2', 'apologising-4']) {
    assert.ok(readingAid(lessonPhrases.get(id), 'ar'), id + ' updated Arabic reading aid');
  }
});

test('F03 curated answers avoid unnecessary speaker gender and misleading semantics', () => {
  const reply = id => replyIndex.get(id)?.text;
  assert.equal(reply('travel').ar, 'عذرًا، القطار التالي الساعة التاسعة.');
  assert.equal(reply('problems').ar, 'عذرًا، سأتحقّق من حجزك.');
  assert.equal(reply('post-office').ar, 'يكلّف عشرة يوروهات.');
  assert.equal(reply('colors').ar, 'لونه أزرق.');
  assert.equal(reply('meal').ar, 'أنصح بحساء الخضار.');
  assert.equal(reply('community-garden').ar, 'هذا صحيح. لنتحقّق مجددًا غدًا.');
  assert.equal(reply('memories').ar, 'ما أكثر شيء تغيّر؟');
  assert.equal(reply('airport-help').uz, 'Bo‘sh o‘rinlari bor keyingi reys ertaga ertalab uchadi.');
  assert.equal(reply('apologising').de, 'Kein Problem, danke, dass Sie mir Bescheid gesagt haben.');
  for (const id of ['travel','problems','post-office','colors','meal','community-garden','memories']) {
    assert.ok(readingAid(replyIndex.get(id), 'ar'), id + ' revised reply reading aid');
  }
});

test('F03 story titles and descriptions remain consistent with plot and context', () => {
  assert.equal(storyIndex.get('route-home').title.uz, 'Uyga qaytishning ikki yo‘li');
  assert.equal(storyIndex.get('missed-coach').title.uz, 'Keyingi avtobusga ulgurolmaslik');
  assert.equal(storyIndex.get('new-meeting-time').title.de, 'Eine neue Zeit für das Treffen');
  assert.equal(storyIndex.get('baggage-report').description.uz,
    'Samir aeroportda yetib kelmagan chamadoni haqida xabar beradi.');
  assert.equal(storyIndex.get('missing-delivery').description.uz,
    'Amina va Kamol birovni ayblashdan oldin dalillarni tekshiradi.');
  assert.equal(storyIndex.get('library-hours-pilot').description.uz,
    'Jamoa qaror qilishdan oldin xarajatlar, qatnashuv va to‘liq bo‘lmagan dalillarni baholaydi.');
});
