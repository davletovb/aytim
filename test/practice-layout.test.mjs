import test from 'node:test';
import assert from 'node:assert/strict';
import { codes } from '../dist/content.mjs';
import { newCourse } from '../dist/engine.mjs';
import { modes, practiceCardOrder, practiceQuestions, mixedQuestions, checkpointQuestions } from '../dist/practice.mjs';
import { skillModes } from '../dist/skill-lab.mjs';

test('one mixed grid contains every active practice mode and all three language skills', () => {
  const kinds = practiceCardOrder.map(([kind]) => kind);
  assert.equal(practiceCardOrder.length, 9);
  assert.equal(kinds.filter(kind => kind === 'checkpoint').length, 1);
  assert.deepEqual(
    practiceCardOrder.filter(([kind]) => kind === 'mode').map(([,id]) => id).sort(),
    Object.keys(modes).sort()
  );
  assert.deepEqual(
    practiceCardOrder.filter(([kind]) => kind === 'skill').map(([,id]) => id).sort(),
    Object.keys(skillModes).sort()
  );
  assert.ok(kinds.indexOf('skill') > 0);
  assert.ok(kinds.lastIndexOf('skill') < kinds.lastIndexOf('mode'));
  assert.equal(practiceCardOrder.at(-1)[0], 'checkpoint');
  assert.ok(!practiceCardOrder.some(([, id]) => id === 'spelling'));
  assert.ok(!Object.hasOwn(modes, 'spelling'));
});

test('no practice or checkpoint needs free typing at any unlocked level or language direction', () => {
  for (const level of [1,2,3,4,5,6,7,8]) {
    const course = newCourse();
    course.journey = { level, evidence: {}, recent: {}, lastActivity: null };
    for (const base of codes) for (const target of codes.filter(code => code !== base)) {
      for (const mode of Object.keys(modes).filter(mode => mode !== 'match')) {
        const questions = practiceQuestions(mode, course, base, target, () => 0.37);
        assert.equal(questions.length, 6);
        assert.ok(questions.every(question => question.options?.length >= 3), mode);
        assert.ok(questions.every(question => question.task !== 'spelling'));
      }
      const mixed = mixedQuestions(course, base, target, () => 0.37);
      assert.equal(mixed.length, 6);
      assert.ok(mixed.every(question => question.options?.length >= 3));
      const checkpoint = checkpointQuestions(level, base, target, () => 0.37);
      assert.equal(checkpoint.length, 12);
      assert.ok(checkpoint.every(question => question.options?.length >= 3));
      assert.ok(checkpoint.every(question => question.task !== 'spelling'));
    }
  }
});

test('retired spelling quiz cannot be opened as a standalone mode', () => {
  assert.throws(() => practiceQuestions('spelling', newCourse(), 'uz', 'tr'), RangeError);
});
