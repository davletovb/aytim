import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeProgress } from '../dist/progress-merge.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { saveLesson } from '../dist/engine.mjs';
import { recordActivity, activitySummary } from '../dist/home-progress.mjs';
import { units } from '../dist/content.mjs';

const day = Date.parse('2026-11-13T09:00:00Z');
const pair = 'uz>en';

function start() {
  return validateState({ base: 'uz', target: 'en', courses: { [pair]: { best: {}, cards: {} } } });
}

function lesson(state, unit, correct, seconds, now = day) {
  const copy = structuredClone(state);
  const course = copy.courses[pair];
  saveLesson(course, unit, unit.phrases.map((entry, index) => ({ id: entry.id, correct: index < correct })), now);
  recordActivity(course, { seconds, lessonId: unit.id, correct }, now);
  return validateState(copy);
}

test('practice from two devices since their last sync is added up, not overwritten', () => {
  const base = lesson(start(), units[0], 6, 120);
  const phone = lesson(base, units[1], 5, 200);
  const desktop = lesson(base, units[2], 7, 300);
  const merged = mergeProgress(base, phone, desktop);
  const course = merged.courses[pair];
  // Both lessons are kept with their own scores.
  for (const unit of [units[0], units[1], units[2]]) assert.ok(course.best[unit.id] > 0, unit.id);
  // Minutes, sessions and XP of the day add each device's own increase once.
  const date = Object.keys(course.activityDays)[0];
  const [b, p, d] = [base, phone, desktop].map(state => state.courses[pair].activityDays[date]);
  assert.equal(course.activityDays[date].seconds, b.seconds + (p.seconds - b.seconds) + (d.seconds - b.seconds));
  assert.equal(course.activityDays[date].sessions, 3);
  assert.equal(course.activityDays[date].xp, b.xp + (p.xp - b.xp) + (d.xp - b.xp));
  assert.deepEqual([...course.activityDays[date].lessons].sort(), [units[0].id, units[1].id, units[2].id].sort());
  assert.equal(activitySummary(merged, day).xp, activitySummary(phone, day).xp + activitySummary(desktop, day).xp - activitySummary(base, day).xp);
});

test('the same merge works in either direction', () => {
  const base = lesson(start(), units[0], 6, 120);
  const phone = lesson(base, units[1], 5, 200);
  const desktop = lesson(base, units[2], 7, 300);
  const first = mergeProgress(base, phone, desktop);
  const second = mergeProgress(base, desktop, phone);
  assert.deepEqual(first.courses[pair].best, second.courses[pair].best);
  assert.deepEqual(first.courses[pair].activityDays, Object.fromEntries(Object.entries(second.courses[pair].activityDays)
    .map(([date, entry]) => [date, { ...entry, lessons: first.courses[pair].activityDays[date].lessons }])));
});

test('a copy that only one device changed is taken as it is', () => {
  const base = lesson(start(), units[0], 6, 120);
  const changed = lesson(base, units[1], 8, 90);
  assert.deepEqual(mergeProgress(base, base, changed), changed);
  assert.deepEqual(mergeProgress(base, changed, base), changed);
});

test('best scores, levels and placement keep the higher value; settings follow the device in use', () => {
  const base = start();
  const phone = structuredClone(base);
  const desktop = structuredClone(base);
  Object.assign(phone.courses[pair], { best: { [units[0].id]: 60 }, journey: { level: 3, evidence: { a: 1 }, recent: {}, lastActivity: null } });
  Object.assign(desktop.courses[pair], { best: { [units[0].id]: 90 }, placementDone: true,
    journey: { level: 2, evidence: { a: 2, b: 1 }, recent: {}, lastActivity: null } });
  phone.transliterate = false;
  desktop.speaker = 'f';
  const merged = mergeProgress(base, phone, desktop);
  assert.equal(merged.courses[pair].best[units[0].id], 90);
  assert.equal(merged.courses[pair].journey.level, 3);
  assert.deepEqual(merged.courses[pair].journey.evidence, { a: 2, b: 1 });
  assert.equal(merged.courses[pair].placementDone, true);
  assert.equal(merged.transliterate, false);
  assert.equal(merged.speaker, 'f');
});

test('a review card both devices changed keeps the more cautious schedule', () => {
  const base = start();
  base.courses[pair].cards = { word: { step: 1, due: day } };
  const missed = structuredClone(base);
  const recalled = structuredClone(base);
  missed.courses[pair].cards.word = { step: -1, due: day + 600000 };
  recalled.courses[pair].cards.word = { step: 2, due: day + 7 * 86400000 };
  assert.deepEqual(mergeProgress(base, recalled, missed).courses[pair].cards.word, { step: -1, due: day + 600000 });
  assert.deepEqual(mergeProgress(base, missed, recalled).courses[pair].cards.word, { step: -1, due: day + 600000 });
});

test('without a common copy, counters keep the larger value instead of counting twice', () => {
  const older = lesson(start(), units[0], 6, 120);
  const newer = lesson(older, units[1], 5, 200);
  // A device that never synced may simply hold an older copy of the same practice.
  const merged = mergeProgress(null, older, newer);
  const date = Object.keys(newer.courses[pair].activityDays)[0];
  assert.deepEqual(merged.courses[pair].activityDays[date], newer.courses[pair].activityDays[date]);
  assert.deepEqual(merged.courses[pair].best, newer.courses[pair].best);
  // The account's settings win over a device that never synced.
  const device = { ...structuredClone(older), target: 'ar', courses: { ...structuredClone(older.courses) } };
  assert.equal(mergeProgress(null, device, newer).target, 'en');
});

test('counts stay valid when both devices answered the same words', () => {
  const base = start();
  base.courses[pair].vocabProgress = { w: { introducedAt: day, attempts: 2, correct: 1, lastAttemptAt: day, reviewEvidence: {} } };
  const phone = structuredClone(base);
  const desktop = structuredClone(base);
  Object.assign(phone.courses[pair].vocabProgress.w, { attempts: 5, correct: 4, lastAttemptAt: day + 10,
    reviewEvidence: { forwardChoice: { attempts: 2, correct: 2, lastCorrect: true } } });
  Object.assign(desktop.courses[pair].vocabProgress.w, { introducedAt: day - 5, attempts: 3, correct: 2, lastAttemptAt: day + 20,
    reviewEvidence: { forwardChoice: { attempts: 1, correct: 0, lastCorrect: false } } });
  const merged = mergeProgress(base, phone, desktop).courses[pair].vocabProgress.w;
  assert.equal(merged.attempts, 2 + 3 + 1);
  assert.equal(merged.correct, 1 + 3 + 1);
  assert.equal(merged.introducedAt, day - 5);
  assert.equal(merged.lastAttemptAt, day + 20);
  assert.deepEqual(merged.reviewEvidence.forwardChoice, { attempts: 3, correct: 2, lastCorrect: true });
  // Skill checks: attempts add up, results keep the best of each.
  const skills = structuredClone(base);
  skills.courses[pair].skills = { writing: { practice: 1, tests: { 1: { attempts: 1, best: 2, total: 3, completed: 4 } } } };
  const a = structuredClone(skills);
  const b = structuredClone(skills);
  a.courses[pair].skills.writing = { practice: 3, tests: { 1: { attempts: 2, best: 4, total: 4, completed: 4 } } };
  b.courses[pair].skills.writing = { practice: 2, tests: { 1: { attempts: 3, best: 3, total: 5, completed: 5 } } };
  assert.deepEqual(mergeProgress(skills, a, b).courses[pair].skills.writing,
    { practice: 4, tests: { 1: { attempts: 4, best: 4, total: 5, completed: 5 } } });
});

test('progress removed on one device stays removed unless the other changed it', () => {
  const base = lesson(start(), units[0], 6, 120);
  const cleared = structuredClone(base);
  delete cleared.courses[pair];
  assert.equal(mergeProgress(base, cleared, base).courses[pair], undefined);
  const practised = lesson(base, units[1], 5, 60);
  assert.ok(mergeProgress(base, cleared, practised).courses[pair].best[units[1].id] > 0);
});
