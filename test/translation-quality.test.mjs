import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, lessonExamples, phrases, units } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { stories } from '../dist/stories.mjs';
import { lessonExchanges } from '../dist/dialogues.mjs';
import { readingAid } from '../dist/reading-aid.mjs';
import { arabicAddressContext } from '../dist/arabic-address.mjs';

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

test('F03 all 9,534 catalog text fields retain translations, correct scripts and punctuation', () => {
  const entries = [
    ...phrases, ...lessonExamples, ...words, ...stories.flatMap(story => story.lines),
    ...[...replyIndex.values()]
  ];
  const answerTexts = stories.flatMap(story => story.questions.flatMap(question =>
    [question.prompt, ...question.choices]));
  assert.equal(phrases.length, 384);
  assert.equal(words.length, 541);
  assert.equal(stories.length, 31);
  assert.equal(entries.length, 1153); // 384 phrases + 1 example + 541 words + 177 story lines + 50 replies
  assert.equal(answerTexts.length, 436); // 109 questions × (prompt + 3 choices)
  assert.equal((entries.length + answerTexts.length) * codes.length, 9534);
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
  assert.equal(phrase('instructions-3').uz, 'Blankni to‘ldirgach, uni shu manzilga yuboring.');
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

test('parallel content uses the course’s English terminology and German working-day wording', () => {
  const request = storyIndex.get('clear-request');
  assert.match(request.lines[3].text.de, /drei Arbeitstagen/u);
  assert.match(request.lines[3].text.en, /three business days/u);
  assert.equal(lessonPhrases.get('apartment-1').text.en, 'I live in a small apartment.');
  assert.equal(lessonPhrases.get('inside-a-building-3').text.en, 'Is there an elevator here?');
  assert.match(storyIndex.get('missing-delivery').lines[5].text.en, /neighboring community center/u);
  const wellbeing = units.find(unit => unit.id === 'wellbeing');
  assert.match(wellbeing.title.tr, /hissediyorsunuz/u);
  assert.match(wellbeing.title.de, /fühlen Sie/u);
});

test('Arabic addressee notes distinguish one listener from a team in every interface language', () => {
  const singular = lessonPhrases.get('problems-3');
  const group = lessonPhrases.get('maintenance-6');
  for (const code of codes) {
    assert.ok(arabicAddressContext(singular, code));
    assert.notEqual(arabicAddressContext(singular, code), arabicAddressContext(group, code));
    assert.match(singular.usage.ar[code], /يمكنكِ/u);
  }
  assert.equal(arabicAddressContext(singular, 'en'), 'speaking to one man');
  assert.equal(arabicAddressContext(group, 'en'), 'addressing a group or organization');
  assert.equal(arabicAddressContext(lessonPhrases.get('greetings-4'), 'en'), '');
});

test('content audit regressions preserve grammar, en-US wording, addressee notes, and story continuity', () => {
  const phrase = id => lessonPhrases.get(id)?.text;
  const word = id => lexicon.get(id)?.text;
  // Multilingual grammar and lexical fixes
  assert.match(phrase('delivery-problem-2').ru, /её доставили\?/u);
  assert.match(phrase('compare-4').ar, /كنت ستختار/u);
  assert.match(phrase('hosting-meal-1').ar, /^تعالَ/u);
  assert.equal(phrase('describing-people-6').ar, 'كيف هي طباع صديقك؟');
  assert.equal(word('word-bakery-2').ar, 'خبزة صغيرة');
  assert.match(phrase('hotel-2').tr, /dâhil/u);
  assert.equal(phrase('takeaway-1').tr, 'Bunu paket olarak alacağım.');
  assert.equal(word('word-greeting-words-2').tr, 'hoşça kalın');
  assert.match(phrase('apologising-2').uz, /xatom/u);
  assert.equal(phrase('short-update-4').uz, 'Men faqat bitta javobni kutyapman.');
  // American English standardization across lessons, vocabulary, and stories
  assert.equal(phrase('post-office-1').en, 'I’d like to send this package to Germany.');
  assert.equal(phrase('apologising-4').en, 'I will make it right today.');
  assert.equal(phrase('short-update-3').en, 'The first part is finished and the second is underway.');
  assert.equal(word('word-public-services-8').en, 'business hours');
  assert.equal(word('word-airport-6').en, 'carry-on bag');
  assert.equal(word('word-booking-conditions-6').en, 'round-trip ticket');
  assert.equal(word('word-formal-correspondence-7').en, 'business day');
  assert.equal(word('word-hobbies-3').en, 'movie');
  assert.equal(word('word-ordering-2').en, 'appetizer');
  assert.equal(word('word-post-words-1').en, 'package');
  assert.equal(word('word-post-words-1').uz, 'jo‘natma');
  assert.equal(word('word-polite-words-3').ar, 'عذرًا');
  assert.equal(word('word-ordering-5').ar, 'نصح');
  assert.equal(word('word-building-words-2').ar, 'ممرّ داخليّ');
  assert.equal(word('word-character-1').de, 'groß gewachsen');
  assert.equal(word('word-seasons-and-time-3').en, 'fall');
  assert.match(storyIndex.get('leaking-tap').questions[0].choices[0].en, /faucet/u);
  assert.match(storyIndex.get('pharmacy-queue').description.en, /line/u);
  assert.match(storyIndex.get('pharmacy-queue').questions[0].choices[2].en, /apartment/u);
  // Story narrative continuity and higher-order question metadata
  const clinic = storyIndex.get('clinic-route');
  assert.match(clinic.lines[7].text.en, /crosswalk/u);
  assert.match(clinic.lines[8].text.en, /^She arrived/u);
  assert.doesNotMatch(clinic.lines[8].text.en, /\bthey\b/i);
  assert.match(clinic.lines[5].text.tr, /asıl/u);
  assert.match(storyIndex.get('missing-delivery').lines[2].text.en, /stolen/u);
  assert.match(storyIndex.get('library-hours-pilot').lines[7].text.uz, /Saida jamoadan/u);
  assert.equal(storyIndex.get('old-photo').questions[3].kind, 'inference');
  assert.equal(storyIndex.get('clear-request').questions[2].kind, 'analysis');
  assert.equal(storyIndex.get('clear-request').questions[3].kind, 'evidence');
  const survey = storyIndex.get('survey-decision');
  assert.match(survey.lines[0].text.en, /bus.*hospital.*all day/u);
  assert.doesNotMatch(survey.lines.map(line => line.text.en).join(' '), /community center|four-week/i);
  assert.equal(survey.questions[0].kind, 'analysis');
  assert.equal(survey.questions[2].kind, 'inference');
  assert.equal(survey.questions[3].kind, 'evidence');
  assert.equal(storyIndex.get('mistake-notebook').questions[3].kind, 'inference');
  // Custom dialogue replies addressing one man carry Arabic addressee notes
  for (const unitId of [
    'routine', 'wellbeing', 'cafe', 'hosting-meal', 'library-visit', 'paying-for-things', 'problems', 'delivery-problem',
    'free-time', 'city-services', 'shopping', 'story', 'describing-people', 'instructions', 'learning-strategies', 'short-update'
  ]) {
    const reply = replyIndex.get(unitId);
    assert.equal(arabicAddressContext(reply, 'en'), 'speaking to one man', reply.id);
    assert.ok(reply.usage?.ar?.en, reply.id + ' missing Arabic usage note');
  }
  const genderedRussianFirstPerson = /(?<!\p{L})(?:я\s+(?:бы\s+|не\s+|уже\s+)?[а-яё]+(?:л|ла|лся|лась)|бы\s+[а-яё]+(?:л|ла|лся|лась)|я\s+(?:рад|рада|готов|готова|должен|должна|согласен|согласна|уверен|уверена|занят|занята|свободен|свободна|болен|больна|голоден|голодна)|выбрала?|поехала?)(?!\p{L})/iu;
  assert.match('Я бы выбрал поезд.', genderedRussianFirstPerson);
  assert.match('Я бы поехала на автобусе.', genderedRussianFirstPerson);
  for (const reply of replyIndex.values()) {
    assert.doesNotMatch(reply.text.ru, genderedRussianFirstPerson, reply.id + ' gendered Russian first-person');
  }
  assert.equal(
    replyIndex.get('compare').text.ru,
    'Будь у меня больше времени, лучше было бы поехать на автобусе: он дешевле.'
  );
  assert.match(replyIndex.get('city-services').text.ar, /الشبّاك/u);
});
