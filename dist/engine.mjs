import { codes, phrases, units } from './content.mjs';
import { lessonExchanges } from './dialogues.mjs';
import { words } from './words.mjs';

export const defaultPair = { base: 'uz', target: 'en' };
export const passingScore = 80; // Minimum percentage of correctly answered questions.
const day = 24 * 60 * 60 * 1000;
const reviewDays = [1, 3, 7, 14, 30];
// Dialogue-only responses have stable IDs and must remain available for
// spaced review after a reply exercise (otherwise practice writes orphan cards).
export const dialogueReviewEntries = units.flatMap(unit =>
  lessonExchanges(unit).map(({ reply }) => reply).filter(entry => entry.id.startsWith('dialogue-'))
);
const reviewEntries = [...phrases, ...words, ...dialogueReviewEntries];

// A first visit opens in the visitor's own language when Aytim has it. Someone
// whose language Aytim also teaches starts out learning English; an English
// speaker starts with Uzbek. Anything else keeps the default pair.
export function preferredPair(tags = []) {
  const base = [tags].flat()
    .map(tag => String(tag ?? '').toLowerCase().split(/[-_]/)[0])
    .find(code => codes.includes(code));
  if (!base) return { ...defaultPair };
  return { base, target: base === defaultPair.target ? defaultPair.base : defaultPair.target };
}

export function validPair(base, target) {
  return codes.includes(base) && codes.includes(target) && base !== target;
}

export function pairKey(base, target) {
  return base + '>' + target;
}

export function newCourse() {
  return { best: {}, cards: {} };
}

export function completed(unit, course) {
  return (course.best[unit.id] ?? 0) >= passingScore;
}

// A repeatable source of randomness. A lesson is built from one of these, so
// the identical lesson can be rebuilt from its seed after a reload.
export function seededRandom(seed) {
  let state = (Math.trunc(seed) >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function makeQuestion(entries, entry, index, base, target, random) {
  const from = index % 2 === 0 ? target : base;
  const to = from === target ? base : target;
  const distractors = shuffled(entries.filter(phrase => phrase.id !== entry.id), random).slice(0, 3);
  const options = shuffled([entry, ...distractors], random);
  return { entry, from, to, options };
}

export function lessonQuestions(unit, base, target, random = Math.random) {
  return shuffled(unit.phrases, random).map((entry, index) => makeQuestion(unit.phrases, entry, index, base, target, random));
}

export function saveLesson(course, unit, answers, now = Date.now()) {
  if (!answers.length) throw new RangeError('Lesson requires answers');
  const score = recordPractice(course, answers, now);
  const percentage = Math.round(score * 100 / answers.length);
  course.best[unit.id] = Math.max(course.best[unit.id] ?? 0, percentage);
  return score;
}

export function recordPractice(course, answers, now = Date.now()) {
  // One session can test the same phrase more than once. Any miss in the
  // session schedules it for review, whatever the order of the answers.
  const missed = new Set(answers.filter(answer => !answer.correct).map(answer => answer.id));
  const seen = new Set();
  for (const answer of answers) {
    if (seen.has(answer.id)) continue;
    seen.add(answer.id);
    if (missed.has(answer.id)) {
      course.cards[answer.id] = { step: -1, due: now };
    } else if (!course.cards[answer.id]) {
      course.cards[answer.id] = { step: 0, due: now + day };
    } else if (course.cards[answer.id].due <= now) {
      saveReview(course, answer.id, true, now);
    }
  }
  return answers.filter(answer => answer.correct).length;
}

export function reviewQueue(course, all = false, now = Date.now()) {
  return reviewEntries
    .filter(phrase => phrase.level && phrase.level <= (course.journey?.level ?? 1) && course.cards[phrase.id] && (all || course.cards[phrase.id].due <= now))
    .sort((first, second) => course.cards[first.id].due - course.cards[second.id].due);
}

export function saveReview(course, id, known, now = Date.now()) {
  const card = course.cards[id];
  if (known && card.due > now) return;
  const step = known ? Math.min(card.step + 1, reviewDays.length - 1) : -1;
  const due = known ? now + reviewDays[step] * day : Math.min(now + 10 * 60 * 1000, card.due > now ? card.due : Infinity);
  course.cards[id] = { step, due };
}

export function reviewStatus(course, id) {
  const card = course.cards[id];
  if (!card) return 'new';
  // Step 3 is earned by recalling the card after its seven-day interval.
  if (card.step >= 3) return 'recalled';
  if (card.step >= 0 || course.journey?.evidence?.[id]) return 'practiced';
  return 'queued';
}

export function reviewStats(course, entries) {
  const counts = { new: 0, queued: 0, practiced: 0, recalled: 0 };
  for (const entry of entries) counts[reviewStatus(course, entry.id)]++;
  return {
    saved: entries.length - counts.new,
    practiced: counts.practiced + counts.recalled,
    recalled: counts.recalled
  };
}

export function searchText(value) {
  return value.toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/ß/g, 'ss')
    .replace(/ı/g, 'i')
    .replace(/[‘’'ʻʼ`]/g, '')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
