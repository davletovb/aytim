import { goals, xpPerActivity } from './home-progress.mjs';
import { validateState } from './progress-data.mjs';

// Combines the progress of two devices signed in to the same account, so that
// nothing practised on either one is lost and no learner has to choose a copy.
//
// `base` is the copy both devices last agreed on (the last state this device
// synced). With it, the merge is three-way: whatever changed on only one side is
// taken from that side, and whatever changed on both is combined per field:
// counters add each device's own increase, best scores keep the maximum, lists
// are joined, and a review card keeps the more cautious schedule. Without a base
// (a device whose copy was never synced) the two cannot be told apart from an
// older copy of the other, so counters keep the larger value instead of adding.

const same = (first, second) => JSON.stringify(first) === JSON.stringify(second);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const clone = value => (value === undefined ? undefined : structuredClone(value));

// Days saved before XP was recorded count at the flat rate, as activitySummary does.
function withDayXp(state) {
  if (!state) return state;
  const copy = structuredClone(state);
  for (const course of Object.values(copy.courses)) {
    for (const day of Object.values(course.activityDays ?? {})) day.xp ??= day.sessions * xpPerActivity;
  }
  return copy;
}

function counter(base, local, remote, known) {
  if (base === undefined) return known ? local + remote : Math.max(local, remote);
  return remote + Math.max(0, local - base);
}

function union(local, remote, limit) {
  return [...new Set([...local, ...remote])].slice(0, limit);
}

// Both devices changed a review card since they last agreed. With that known,
// a miss on either one wins (the lower step comes back sooner). Without it, the
// card further along is the newer one.
function card(local, remote, known) {
  if (local.step !== remote.step) return (local.step < remote.step) === known ? local : remote;
  return (local.due < remote.due) === known ? local : remote;
}

// Settles a value both devices changed in different ways. `path` names it,
// for example ['courses', 'uz>en', 'activityDays', '2026-11-13', 'xp'].
function settle(path, base, local, remote, known, settingsFromLocal) {
  // A value one device removed and the other changed is kept: learning is never dropped.
  if (local === undefined) return clone(remote);
  if (remote === undefined) return clone(local);
  const [area, , section, , field, , part] = path;
  if (path[0] === 'onboarded') return local || remote;
  if (path.length === 1) return clone(settingsFromLocal ? local : remote); // language pair and settings
  if (area !== 'courses') return clone(local);
  if (['best', 'practiceBest', 'storyBest', 'readingDepthBest'].includes(section)) return Math.max(local, remote);
  if (section === 'cards') return clone(card(local, remote, known));
  if (section === 'reviewAssessmentVersion') return Math.max(local, remote);
  if (section === 'placementDone') return local || remote;
  if (section === 'activityDays') {
    if (field === 'lessons') return union(local, remote, goals.lessons);
    if (field === 'recalled') return union(local, remote, goals.recalled);
    return counter(base, local, remote, known);
  }
  if (section === 'skills') {
    // ['courses', pair, 'skills', skill, 'practice'] or [..., 'tests', level, field]
    if (field === 'practice' || part === 'attempts') return counter(base, local, remote, known);
    if (field === 'tests' && part) return Math.max(local, remote);
    return clone(local);
  }
  if (section === 'vocabProgress') {
    if (field === 'introducedAt') return Math.min(local, remote);
    if (field === 'lastAttemptAt') return Math.max(local, remote);
    if (field === 'reviewEvidence' && part === 'lastCorrect') return local;
    return typeof local === 'number' ? counter(base, local, remote, known) : clone(local);
  }
  if (section === 'journey') {
    // ['courses', pair, 'journey', 'level'] or ['courses', pair, 'journey', 'evidence', id]
    if (['level', 'evidence'].includes(path[3])) return Math.max(local, remote);
    return clone(local);
  }
  return clone(local);
}

// A card's step and due date change together, so a card is settled as one value.
// (Lists are never merged item by item either: they are not plain objects.)
const whole = path => path[2] === 'cards' && path.length === 4;

function merge(path, base, local, remote, known, settingsFromLocal) {
  if (same(local, base)) return clone(remote);
  if (same(remote, base)) return clone(local);
  if (!isObject(local) || !isObject(remote) || whole(path)) return settle(path, base, local, remote, known, settingsFromLocal);
  const result = {};
  for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const value = merge([...path, key], isObject(base) ? base[key] : undefined, local[key], remote[key], known, settingsFromLocal);
    if (value !== undefined) result[key] = value;
  }
  return result;
}

// A correct count can never exceed its attempts once both sides are added up.
function tidy(state) {
  for (const course of Object.values(state.courses)) {
    for (const progress of Object.values(course.vocabProgress ?? {})) {
      progress.correct = Math.min(progress.correct, progress.attempts);
      if (progress.recallAttempts !== undefined) progress.recallCorrect = Math.min(progress.recallCorrect, progress.recallAttempts);
      for (const evidence of Object.values(progress.reviewEvidence ?? {})) evidence.correct = Math.min(evidence.correct, evidence.attempts);
    }
  }
  return state;
}

export function mergeProgress(base, local, remote) {
  const known = Boolean(base);
  // Settings follow the device in use. Without a common copy they follow the account,
  // unless only this device has finished onboarding: then its choices are deliberate.
  const settingsFromLocal = known || (Boolean(local.onboarded) && !remote.onboarded);
  const merged = merge([], withDayXp(base ? validateState(base) : undefined), withDayXp(validateState(local)),
    withDayXp(validateState(remote)), known, settingsFromLocal);
  return validateState(tidy(merged));
}
