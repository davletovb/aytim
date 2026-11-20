import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, phrases, units } from '../dist/content.mjs';
import { exchanges, lessonExchanges } from '../dist/dialogues.mjs';
import { readingAid } from '../dist/reading-aid.mjs';
import { newCourse, recordPractice, reviewQueue, dialogueReviewEntries, seededRandom } from '../dist/engine.mjs';
import { replyQuestions } from '../dist/practice.mjs';

// This test protects the editorially-curated F01/F03 slice. It checks
// structural correctness and known bad pair regressions; native-speaker
// review is still required for full idiomatic translation certification.
test('F01 preserves only curated, six-language, speaker-to-speaker responses', () => {
  assert.equal(units.length, 64);
  assert.equal(phrases.length, 384); // New dialogue-only replies do not modify lesson scores.
  assert.equal(Object.values(exchanges).flat().length, 69);
  let custom = 0;
  for (const unit of units) {
    const actual = lessonExchanges(unit);
    assert.ok(actual.length >= 1, unit.id + ' missing curated dialogue');
    assert.equal(actual.length, (exchanges[unit.id] ?? []).length, unit.id);
    for (const { cue, reply } of actual) {
      assert.ok(cue?.id && reply?.id && cue.id !== reply.id, unit.id);
      for (const code of codes) {
        assert.ok(cue.text[code]?.trim(), unit.id + ' ' + code + ' cue');
        assert.ok(reply.text[code]?.trim(), unit.id + ' ' + code + ' reply');
        assert.notEqual(cue.text[code], reply.text[code], unit.id + ' ' + code);
      }
      if (reply.id.startsWith('dialogue-')) {
        custom++;
        assert.ok(readingAid(reply, 'ar')?.length > 0, unit.id + ' Arabic reading aid');
      }
    }
  }
  assert.equal(custom, 50);
});

test('F01 rejected non-responsive answers do not reappear', () => {
  const byId = id => lessonExchanges(units.find(unit => unit.id === id));
  assert.equal(byId('introductions').find(item => item.cue.text.en === 'Where are you from?').reply.text.en,
    'I’m from Uzbekistan.');
  assert.equal(byId('meal').find(item => item.cue.text.en === 'Which dish do you recommend?').reply.text.en,
    'I recommend the vegetable soup.');
  assert.ok(!byId('classroom-phrases').some(item =>
    item.cue.text.en === 'I don’t understand.' && item.reply.text.en === 'Could you speak more slowly, please?'));
  assert.ok(!byId('paying-for-things').some(item =>
    item.cue.text.en === 'Do you take cards?' && item.reply.text.en === 'Is there an ATM nearby?'));
  assert.equal(byId('work').find(item => item.cue.text.en === 'When is this task due?').reply.text.en,
    'It’s due on Friday.');
  assert.equal(byId('plans')[0].reply.id, 'plans-3');
  assert.equal(byId('compare')[0].reply.text.en,
    'If I had more time, I’d take the bus because it’s cheaper.');
  assert.deepEqual(byId('news-reports')[0].distractors.map(item => item.id),
    ['news-reports-1', 'news-reports-5', 'memories-4']);
  assert.deepEqual(byId('evaluating-evidence')[0].distractors.map(item => item.id),
    ['evaluating-evidence-1', 'evaluating-evidence-2', 'evaluating-evidence-5']);
  assert.deepEqual(byId('negotiating-priorities')[0].distractors.map(item => item.id),
    ['negotiating-priorities-3', 'negotiating-priorities-5', 'negotiating-priorities-6']);
  const expectedDistractors = {
    'numbers': ['numbers-2', 'numbers-3', 'numbers-4'],
    'belongings': ['belongings-1', 'belongings-2', 'belongings-3', 'belongings-5'],
    'where-things-are': ['where-things-are-2', 'where-things-are-3', 'where-things-are-4', 'where-things-are-5'],
    'family': ['family-1', 'family-2', 'family-4', 'family-6'],
    'free-time': ['free-time-1', 'free-time-2', 'free-time-3', 'free-time-5'],
    'home-chores': ['home-chores-1', 'home-chores-3', 'home-chores-5'],
    'telling-time': ['telling-time-1', 'telling-time-2', 'telling-time-3', 'telling-time-4'],
    'plans': ['plans-4', 'plans-6', 'appointment-6'],
    'compare': ['compare-2', 'compare-3', 'compare-5'],
    'describing-people': ['describing-people-1', 'describing-people-3', 'describing-people-6'],
    'reflection': ['reflection-1', 'reflection-3', 'reflection-6'],
    'instructions': ['instructions-1', 'instructions-5', 'formal-requests-2'],
    'learning-strategies': ['reflection-1', 'reflection-6', 'formal-requests-5'],
    'feedback': ['feedback-2', 'feedback-4', 'messages-3'],
    'short-update': ['short-update-1', 'short-update-2', 'short-update-3', 'short-update-4']
  };
  for (const [unitId, ids] of Object.entries(expectedDistractors)) {
    assert.deepEqual(byId(unitId)[0].distractors.map(item => item.id), ids, unitId);
  }
});

test('F01 reply exercises remain playable at each level and for all 30 language directions', () => {
  for (let level = 1; level <= 8; level++) {
    const course = newCourse();
    course.journey = { level, evidence: {}, recent: {}, lastActivity: null };
    for (const base of codes) for (const target of codes.filter(code => code !== base)) {
      const questions = replyQuestions(course, base, target, () => 0.37);
      assert.equal(questions.length, 6, 'level ' + level + ' ' + base + '>' + target);
      for (const question of questions) {
        assert.equal(question.task, 'reply');
        assert.ok(question.cue.id && question.entry.id);
        assert.notEqual(question.cue.id, question.entry.id);
        assert.equal(question.options.length, 4);
        assert.equal(new Set(question.options).size, 4);
        assert.ok(question.options.includes(question.entry));
        assert.ok(!question.options.includes(question.cue));
        assert.equal(new Set(question.options.map(option => option.text[target])).size, 4,
          'ambiguous repeated answer display: ' + level + ' ' + target);
      }
    }
  }
});

test('the cup color exchange only offers unrelated phrases as distractors', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    const question = replyQuestions(newCourse(), base, target, seededRandom(2)).find(item => item.cue.id === 'colors-1');
    assert.ok(question, base + '>' + target);
    assert.equal(question.entry.id, 'dialogue-colors-1');
    assert.deepEqual(question.options.map(option => option.id).sort(),
      ['colors-3', 'colors-4', 'colors-6', 'dialogue-colors-1']);
  }
});

test('F03 repairs register and naturalness flags while preserving Arabic word reading aids', () => {
  const phrase = id => phrases.find(item => item.id === id);
  assert.equal(phrase('greetings-1').text.ru, 'Привет!');
  assert.equal(phrase('greetings-6').text.ar, 'أراك غدًا!');
  assert.ok(readingAid(phrase('greetings-6'), 'ar'));
  assert.equal(phrase('bakery-1').text.ar, 'هل خُبز هذا الرغيف اليوم؟');
  assert.ok(readingAid(phrase('bakery-1'), 'ar'));
  assert.equal(
    phrase('evaluating-evidence-1').text.de,
    'Die Umfrageergebnisse sind hilfreich, spiegeln aber möglicherweise nicht die Meinungen aller Einwohner wider.'
  );
});

test('custom replies have stable review IDs and can be studied after a reply round', () => {
  assert.equal(dialogueReviewEntries.length, 50);
  assert.equal(new Set(dialogueReviewEntries.map(entry => entry.id)).size, 50);
  const course = newCourse();
  course.journey = { level: 1, evidence: {}, recent: {}, lastActivity: null };
  const reply = dialogueReviewEntries.find(entry => entry.id.startsWith('dialogue-introductions-'));
  const now = 1700000000000;
  recordPractice(course, [{ id: reply.id, correct: false }], now);
  const due = reviewQueue(course, false, now + 1);
  assert.ok(due.some(entry => entry.id === reply.id));
});
