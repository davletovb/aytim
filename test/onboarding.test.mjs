import test from 'node:test';
import assert from 'node:assert/strict';
import { existingLearner, needsOnboarding, targetFor } from '../dist/onboarding.mjs';
import { applyPlacement, placementSettled } from '../dist/journey.mjs';
import { newCourse, seededRandom } from '../dist/engine.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { mergeProgress } from '../dist/progress-merge.mjs';
import { copy } from '../dist/copy.mjs';

const fresh = (extra = {}) => ({ base: 'uz', target: 'en', transliterate: true, courses: {}, ...extra });

test('only a learner with no saved copy and no learning sees onboarding', () => {
  assert.equal(needsOnboarding({ hasLocal: false, state: fresh() }), true);
  assert.equal(needsOnboarding({ hasLocal: true, state: fresh() }), false, 'a saved copy means an existing learner');
  assert.equal(needsOnboarding({ hasLocal: false, state: fresh({ onboarded: true }) }), false);
  const practised = fresh({ courses: { 'uz>en': { ...newCourse(), best: { greetings: 100 } } } });
  assert.equal(needsOnboarding({ hasLocal: false, state: practised }), false);
  assert.equal(existingLearner(null), false);
});

test('choosing the language you speak keeps the language you learn unless they match', () => {
  assert.equal(targetFor('ru', 'en'), 'en');
  assert.equal(targetFor('en', 'en'), 'uz');
  assert.equal(targetFor('uz', 'uz'), 'en');
});

test('the onboarded flag is saved, synced and never lost in a merge', () => {
  assert.equal(validateState(fresh({ onboarded: true })).onboarded, true);
  assert.equal('onboarded' in validateState(fresh()), false);
  assert.throws(() => validateState(fresh({ onboarded: 'yes' })));
  // Either device having finished onboarding is enough.
  assert.equal(mergeProgress(fresh(), fresh({ onboarded: true }), fresh()).onboarded, true);
  assert.equal(mergeProgress(null, fresh(), fresh({ onboarded: true })).onboarded, true);
  // Without a common copy, a device that just finished onboarding keeps its choice over
  // an account copy that was never onboarded; otherwise the account's settings win.
  const chosen = fresh({ base: 'ru', target: 'de', onboarded: true });
  assert.deepEqual([mergeProgress(null, chosen, fresh()).base, mergeProgress(null, chosen, fresh()).target], ['ru', 'de']);
  assert.equal(mergeProgress(null, fresh({ base: 'ru', target: 'de' }), fresh()).base, 'uz');
});

test('placement stops as soon as later answers can no longer change the level', () => {
  const random = seededRandom(7);
  const place = answers => applyPlacement(newCourse(), answers);
  for (let run = 0; run < 500; run++) {
    const skill = random();
    const answers = Array.from({ length: 16 }, (_, index) => ({ correct: random() < skill + 0.3 - index * 0.04 }));
    const stop = answers.findIndex((_, index) => placementSettled(answers.slice(0, index + 1)));
    assert.ok(stop >= 0, 'every test settles by its last answer');
    assert.equal(place(answers.slice(0, stop + 1)), place(answers), 'stopping early gives the same level');
    // And it never stops while the level is still open.
    for (let index = 0; index < stop; index++) assert.equal(placementSettled(answers.slice(0, index + 1)), false);
  }
  // A beginner who misses both Level 1 questions is done after two.
  assert.equal(placementSettled([{ correct: false }, { correct: false }]), true);
  // One slip is forgiven, so a single miss does not end the test.
  assert.equal(placementSettled([{ correct: true }, { correct: false }]), false);
  assert.equal(placementSettled([{ correct: false }]), false);
});

test('onboarding text exists in all six interface languages', () => {
  const keys = ['welcomeEyebrow', 'welcomeStep', 'welcomeBaseTitle', 'welcomeBaseLead', 'welcomeTargetTitle', 'welcomeTargetLead',
    'welcomeLevelTitle', 'welcomeNew', 'welcomeNewLead', 'welcomeSome', 'welcomeSomeLead', 'welcomeBack'];
  for (const [code, strings] of Object.entries(copy)) for (const key of keys) assert.ok(strings[key]?.trim(), code + ': ' + key);
  for (const strings of Object.values(copy)) assert.match(strings.welcomeStep, /\{n\}/);
});
