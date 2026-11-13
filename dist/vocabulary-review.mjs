import { searchText, shuffled } from './engine.mjs';

// Every review round tests both directions, in both formats. Only due/saved
// entries are scored; filler pairs supply plausible distractors without
// silently changing their review schedules.
export const reviewFormats = ['forwardChoice', 'reverseChoice', 'forwardMatch', 'reverseMatch'];
const direction = (mode, base, target) => mode.startsWith('forward')
  ? { from: base, to: target, direction: 'forward' }
  : { from: target, to: base, direction: 'reverse' };
const key = (entry, language) => searchText(entry.text[language]);

function uniqueEntries(entries, from, to, used = new Set()) {
  const seenFrom = new Set(), seenTo = new Set();
  for (const item of used) {
    seenFrom.add(key(item, from));
    seenTo.add(key(item, to));
  }
  const kept = [];
  for (const entry of entries) {
    const first = key(entry, from), second = key(entry, to);
    if (!first || !second || seenFrom.has(first) || seenTo.has(second)) continue;
    kept.push(entry);
    seenFrom.add(first); seenTo.add(second);
  }
  return kept;
}

export function reviewBatch(queue, base, target, limit = 4) {
  if (base === target || !base || !target) throw new RangeError('Two distinct languages required');
  return uniqueEntries(queue, base, target).slice(0, limit);
}

function fillers(entries, pool, base, target, count, random) {
  const sameKind = entry => entry.id.startsWith('word-') === entries[0].id.startsWith('word-');
  const candidates = shuffled(pool.filter(entry => !entries.some(q => q.id === entry.id)), random);
  const ordered = [...candidates.filter(sameKind), ...candidates.filter(entry => !sameKind(entry))];
  return uniqueEntries(ordered, base, target, new Set(entries)).slice(0, count);
}

// A returned round has 2 MC questions per selected entry + 2 matching boards.
// Each selected entry earns precisely four independently scored attempts.
export function createReviewRound(queue, pool, base, target, random = Math.random) {
  const entries = reviewBatch(queue, base, target);
  if (!entries.length) throw new RangeError('No entries to review');
  const fullBoard = [...entries, ...fillers(entries, pool, base, target, Math.max(0, 4 - entries.length), random)];
  if (fullBoard.length < 2) throw new RangeError('Not enough distinct vocabulary to match');
  const stages = [];
  for (const mode of ['forwardChoice', 'reverseChoice']) {
    const { from, to, direction: reviewDirection } = direction(mode, base, target);
    for (const entry of shuffled(entries, random)) {
      const choices = fillers([entry], pool, from, to, 3, random);
      if (choices.length < 2) throw new RangeError('Not enough distinct options');
      stages.push({
        kind: 'choice', direction: reviewDirection, format: 'choice',
        entry, from, to, options: shuffled([entry, ...choices], random)
      });
    }
  }
  for (const mode of ['forwardMatch', 'reverseMatch']) {
    const { from, to, direction: reviewDirection } = direction(mode, base, target);
    stages.push({
      kind: 'matching', direction: reviewDirection, format: 'match',
      from, to, sources: shuffled(fullBoard, random), targets: shuffled(fullBoard, random),
      gradedIds: entries.map(entry => entry.id)
    });
  }
  return { entries, stages, total: entries.length * 4 };
}

export function scoreReviewRound(entries, evaluations) {
  const reviewed = [];
  for (const entry of entries) {
    const results = evaluations.filter(item => item.id === entry.id);
    const names = results.map(item => item.direction + (item.format === 'choice' ? 'Choice' : 'Match'));
    if (results.length !== 4 || new Set(names).size !== 4 ||
        reviewFormats.some(mode => !names.includes(mode))) throw new RangeError('Incomplete review');
    reviewed.push({ id: entry.id, correct: results.every(item => item.correct) });
  }
  return {
    correct: evaluations.filter(item => item.correct).length,
    total: entries.length * 4,
    passed: reviewed.filter(entry => entry.correct).length,
    reviewed
  };
}

// Never inherit progress from the former self-rated flashcards. Preserve
// exposure/test history, but requeue previously advanced cards for objectively
// scored review. New courses have version 2 from creation.
export function ensureObjectiveReview(course, now = Date.now()) {
  if (course.reviewAssessmentVersion === 2) return false;
  course.cards ??= {};
  for (const card of Object.values(course.cards)) {
    if (card.step >= 0) { card.step = -1; card.due = now; }
  }
  course.reviewAssessmentVersion = 2;
  return true;
}
