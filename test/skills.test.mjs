import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, languages } from '../dist/content.mjs';
import { newCourse } from '../dist/engine.mjs';
import { accessibleLevel } from '../dist/journey.mjs';
import { skillModes, skillRoundSize, createSkillRound, matchesReference, recordSkillRound, skillSnapshot } from '../dist/skill-lab.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';

const makeCourse = level => {
  const current = newCourse();
  current.journey = { level, evidence: {}, recent: {}, lastActivity: null };
  return current;
};

test('each skill creates five distinct, current-level contexts across all 30 language directions', () => {
  for (const level of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const current = makeCourse(level);
    for (const base of codes) for (const target of codes.filter(code => code !== base)) {
      for (const skill of Object.keys(skillModes)) for (const assessment of [false, true]) {
        const round = createSkillRound(skill, current, base, target, assessment, () => 0.423);
        assert.equal(round.skill, skill);
        assert.equal(round.level, level);
        assert.equal(round.assessment, assessment);
        assert.equal(round.tasks.length, skillRoundSize);
        assert.equal(new Set(round.tasks.map(task => task.unitId)).size, skillRoundSize);
        for (const task of round.tasks) {
          assert.equal(task.level, level);
          assert.equal(task.entry.level, level);
          assert.ok(task.entry.text[base]?.trim());
          assert.ok(task.entry.text[target]?.trim());
          if (skill === 'writing' || skill === 'listening') {
            assert.ok(task.wordBank.expected.length > 1,
              skill + ' should never offer single-word ordering: ' + task.unitId + ' ' + target);
          }
        }
      }
    }
  }
});

test('new learners have no access to future-level writing, listening, or speaking tasks', () => {
  const course = newCourse();
  for (const skill of Object.keys(skillModes)) {
    assert.equal(createSkillRound(skill, course, 'uz', 'tr', true).level, 1);
  }
  course.practiceBest = { 'checkpoint-1': 8 };
  assert.equal(accessibleLevel(course), 2);
  assert.equal(createSkillRound('listening', course, 'uz', 'tr', true).level, 2);
  assert.equal(createSkillRound('writing', course, 'uz', 'tr', true).level, 2);
  assert.equal(createSkillRound('speaking', course, 'uz', 'tr', true).level, 2);
  assert.equal(createSkillRound('speaking', course, 'uz', 'tr', false).level <= 2, true);
});

test('writing uses word banks at all levels; advanced speaking stays open-ended', () => {
  for (const skill of Object.keys(skillModes)) {
    const beginner = createSkillRound(skill, makeCourse(1), 'uz', 'tr', true);
    assert.ok(beginner.tasks.every(task => !task.openEnded));
    const advanced = createSkillRound(skill, makeCourse(6), 'uz', 'tr', true);
    assert.ok(advanced.tasks.every(task => task.context?.uz?.length > 0));
    if (skill === 'speaking') {
      assert.equal(advanced.tasks.filter(task => task.openEnded).length, 2);
    } else {
      assert.ok(advanced.tasks.every(task => !task.openEnded));
    }
    if (skill === 'writing') {
      assert.ok(beginner.tasks.every(task => task.wordBank?.tray.length >= 1));
      assert.ok(advanced.tasks.every(task => task.wordBank?.tray.length >= 1));
    }
  }
});

test('higher-level checks cannot be recorded before their level is unlocked', () => {
  const course = newCourse();
  const future = createSkillRound('writing', makeCourse(4), 'uz', 'tr', true);
  assert.throws(() => recordSkillRound(course, future, future.tasks.map(() => ({
    attempted: true, scorable: false, referenceMatch: false
  }))));
  assert.equal(course.skills, undefined);
});

test('reference comparison ignores punctuation but does not silently reject Turkish I or Arabic short vowels', () => {
  assert.equal(matchesReference(' Merhaba, dünya! ', 'merhaba dünya', 'tr'), true);
  assert.equal(matchesReference('İSTANBUL', 'istanbul', 'tr'), true);
  assert.equal(matchesReference('مَرْحَبًا!', 'مرحبا', 'ar'), true);
  assert.equal(matchesReference('Good evening', 'Good morning', 'en'), false);
  assert.equal(matchesReference(' ', 'Hello', 'en'), false);
});

test('practice and skill checks do not change level access or lesson completion', () => {
  const course = makeCourse(3);
  const originalBest = structuredClone(course.best);
  const skill = createSkillRound('writing', course, 'uz', 'tr', true, () => 0.29);
  const outcomes = skill.tasks.map((_, i) => ({
    attempted: true, scorable: true, referenceMatch: i < 3
  }));
  const result = recordSkillRound(course, skill, outcomes);
  assert.deepEqual(result, { completed: 5, matched: 3, scored: 5, total: 5 });
  assert.deepEqual(course.best, originalBest);
  assert.equal(accessibleLevel(course), 3);
  const snapshot = skillSnapshot(course, 'writing', 3);
  assert.equal(snapshot.attempts, 1);
  assert.equal(snapshot.best, 3);
  assert.equal(snapshot.scored, 5);
  assert.equal(snapshot.completed, 5);
  assert.equal(snapshot.practice, 0);
  const repeat = recordSkillRound(course, skill, skill.tasks.map(() => ({ attempted: true, scorable: true, referenceMatch: false })));
  assert.equal(repeat.matched, 0);
  assert.equal(skillSnapshot(course, 'writing', 3).best, 3);
  assert.equal(skillSnapshot(course, 'writing', 3).attempts, 2);
  recordSkillRound(course, { ...skill, assessment: false }, outcomes);
  assert.equal(skillSnapshot(course, 'writing', 3).practice, 1);
  assert.equal(accessibleLevel(course), 3);
});

test('listening fallback is unscored and speaking stores participation, never a pronunciation score', () => {
  const course = newCourse();
  for (const kind of ['listening', 'speaking']) {
    const round = createSkillRound(kind, course, 'uz', 'de', true);
    const outcomes = round.tasks.map(() => ({ attempted: true, scorable: false, referenceMatch: false }));
    const result = recordSkillRound(course, round, outcomes);
    assert.equal(result.completed, 5);
    assert.equal(result.scored, 0);
    assert.equal(result.matched, 0);
    const snapshot = skillSnapshot(course, kind, 1);
    assert.equal(snapshot.completed, 5);
    assert.equal(snapshot.scored, 0);
  }
  assert.equal(course.practiceBest, undefined);
  assert.equal(accessibleLevel(course), 1);
});

test('skill results round trip through the Worker-compatible validated progress schema', () => {
  const current = makeCourse(4);
  const round = createSkillRound('listening', current, 'uz', 'en', true);
  recordSkillRound(current, round, round.tasks.map((_, index) => ({
    attempted: true, scorable: index < 4, referenceMatch: index < 2
  })));
  recordSkillRound(current, { ...round, skill: 'speaking', assessment: false },
    round.tasks.map(() => ({ attempted: true, scorable: false, referenceMatch: false })));
  const state = { base: 'uz', target: 'en', courses: { 'uz>en': current, 'uz>tr': newCourse() } };
  const restored = validateState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.courses['uz>en'].skills, current.skills);
  assert.equal(restored.courses['uz>tr'].skills, undefined);
  assert.equal(skillSnapshot(restored.courses['uz>en'], 'listening', 4).best, 2);
  assert.equal(skillSnapshot(restored.courses['uz>en'], 'speaking', 4).practice, 1);
});

test('save validation rejects malformed or oversized skill results', () => {
  const state = skills => ({ base: 'uz', target: 'en', courses: { 'uz>en': { ...newCourse(), skills } } });
  assert.throws(() => validateState(state({ listening: { practice: -1, tests: {} } })));
  assert.throws(() => validateState(state({ unknown: { practice: 1, tests: {} } })));
  assert.throws(() => validateState(state({ writing: { practice: 1, tests: { 9: { attempts: 1, best: 0, total: 0, completed: 0 } } } })));
  assert.throws(() => validateState(state({ speaking: { practice: 0, tests: { 1: { attempts: 1, best: 5, total: 0, completed: 5 } } } })));
});

test('every added skill control has a translation in all six interface languages', () => {
  assert.deepEqual(Object.keys(skillModes).sort(), ['listening', 'speaking', 'writing']);
  for (const code of codes) {
    for (const key of ['skillSection','skillSectionLead','skillListening','skillWriting','skillSpeaking',
      'skillPracticeAction','skillTestAction','skillListenInstruction','skillWriteInstruction',
      'skillSpeakInstruction','skillNoAudio','skillPrivacy',
      'skillMicProblem','skillReference','skillNotExact','skillSummary','skillAgain']) {
      assert.ok(copy[code][key]?.trim(), code + ': ' + key);
    }
    assert.ok(languages[code].locale);
  }
});
