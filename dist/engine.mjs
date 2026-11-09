import { codes, phrases } from './content.mjs';
import { words } from './words.mjs';

export const defaultPair = { base: 'uz', target: 'en' };
export const passingScore = 4;
const day = 24 * 60 * 60 * 1000;
const reviewDays = [1, 3, 7, 14, 30];
const reviewEntries = [...phrases, ...words];

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
  const score = recordPractice(course, answers, now);
  course.best[unit.id] = Math.max(course.best[unit.id] ?? 0, score);
  return score;
}

export function recordPractice(course, answers, now = Date.now()) {
  for (const answer of answers) {
    if (!answer.correct) {
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
