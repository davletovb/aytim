import { words } from './words.mjs';

const knownWords = new Set(words.map(entry => entry.id));
const day = 24 * 60 * 60 * 1000;
const empty = (now) => ({
  introducedAt: now, attempts: 0, correct: 0,
  recallAttempts: 0, recallCorrect: 0, lastAttemptAt: 0
});

// Encountering the lesson's word-introduction screen schedules *all* its
// words for delayed retrieval. Exposure is not a successful recall.
export function introduceVocabulary(course, entries, now = Date.now()) {
  course.vocabProgress ??= {};
  course.cards ??= {};
  let added = 0;
  for (const entry of entries) {
    if (!knownWords.has(entry?.id)) continue;
    if (!course.vocabProgress[entry.id]) {
      course.vocabProgress[entry.id] = empty(now);
      added++;
    }
    // Never postpone a word the learner has already tried or marked due.
    course.cards[entry.id] ??= { step: -1, due: now + day };
  }
  return added;
}

// Record objectively scored vocabulary answers separately from exposure. The
// same word can be tested several times across sessions and directions; a
// repeated question within one activity is only counted once by recordPractice.
export function recordVocabularyAttempts(course, answers, now = Date.now()) {
  const eligible = answers.filter(answer => knownWords.has(answer.id) &&
    answer.scored !== false && Boolean(answer.skill));
  if (!eligible.length) return;
  course.vocabProgress ??= {};
  for (const answer of eligible) {
    const progress = course.vocabProgress[answer.id] ??= empty(now);
    progress.attempts++;
    if (answer.correct) progress.correct++;
    progress.lastAttemptAt = now;
  }
}

// This event is a *self-reported* flashcard recall, not evidence of speech
// proficiency. Keep recall counts separate from multiple-choice accuracy.
export function recordVocabularyRecall(course, id, known, now = Date.now()) {
  if (!knownWords.has(id)) return;
  course.vocabProgress ??= {};
  const progress = course.vocabProgress[id] ??= empty(now);
  progress.recallAttempts++;
  if (known) progress.recallCorrect++;
  progress.lastAttemptAt = now;
}

export function vocabularyCoverage(course, entries = words, now = Date.now()) {
  const allowed = entries.filter(entry => knownWords.has(entry.id));
  let introduced = 0, tested = 0, recallTested = 0, due = 0, retained = 0;
  for (const word of allowed) {
    const progress = course.vocabProgress?.[word.id];
    if (!progress) continue;
    introduced++;
    if (progress.attempts) tested++;
    if (progress.recallAttempts) recallTested++;
    const card = course.cards?.[word.id];
    if (card?.due <= now) due++;
    if (card?.step >= 3) retained++;
  }
  return { total: allowed.length, introduced, tested, recallTested, due, retained };
}
