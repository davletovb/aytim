import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, phrases, units } from '../dist/content.mjs';
import { exchanges, lessonExchanges } from '../dist/dialogues.mjs';
import { readingAid } from '../dist/reading-aid.mjs';
import { newCourse } from '../dist/engine.mjs';
import { replyQuestions } from '../dist/practice.mjs';

// This test protects the editorially-curated F01/F03 slice. It checks
// structural correctness and known bad pair regressions; native-speaker
// review is still required for full idiomatic translation certification.
test('F01 preserves only curated, six-language, speaker-to-speaker responses', () => {
  assert.equal(units.length, 64);
  assert.equal(phrases.length, 384); // New dialogue-only replies do not modify lesson scores.
  assert.equal(Object.values(exchanges).flat().length, 46);
  let custom = 0;
  for (const unit of units) {
    const actual = lessonExchanges(unit);
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
  assert.equal(custom, 28);
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
    item.cue.text.en === 'Do you take cards?' && item.reply.text.en === 'Is there a cash machine nearby?'));
  assert.equal(byId('work').find(item => item.cue.text.en === 'When is this task due?').reply.text.en,
    'It’s due on Friday.');
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
