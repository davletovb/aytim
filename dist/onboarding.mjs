import { hasProgress } from './account-data.mjs';
import { codes } from './content.mjs';

// First visit: ask which language the learner speaks and wants to learn, then
// how well they know it. Only someone with no saved progress at all sees it;
// finishing it sets `onboarded`, which syncs, so the account's other devices skip it.

// A saved copy that was never onboarded and holds no learning is only defaults.
export function existingLearner(state) {
  return Boolean(state?.onboarded) || (state ? hasProgress(state) : false);
}

// Show onboarding when this device has no saved copy for the learner (guest or
// account) and the copy in memory is not an existing learner's.
export function needsOnboarding({ hasLocal, state }) {
  return !hasLocal && !existingLearner(state);
}

// The language to learn when the learner picks the one they speak: keep the current
// choice unless it is now the same language.
export function targetFor(base, target) {
  if (target !== base && codes.includes(target)) return target;
  return base === 'en' ? 'uz' : 'en';
}
