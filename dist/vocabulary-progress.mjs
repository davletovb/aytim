import { words } from './words.mjs';

const knownWords = new Set(words.map(entry => entry.id));
const day = 24 * 60 * 60 * 1000;
const empty = (now) => ({
  introducedAt: now, attempts: 0, correct: 0,
  lastAttemptAt: 0, reviewEvidence: {}
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

// Only answers selected in a multiple-choice or pair-matching task are
// objective evidence. Track both formats/directions independently.
const modes = ['forwardChoice', 'reverseChoice', 'forwardMatch', 'reverseMatch'];
export function recordObjectiveVocabularyReview(course, evaluations, now = Date.now()) {
  course.vocabProgress ??= {};
  for (const answer of evaluations) {
    if (!knownWords.has(answer.id)) continue;
    const mode = answer.direction + (answer.format === 'choice' ? 'Choice' : 'Match');
    if (!modes.includes(mode) || typeof answer.correct !== 'boolean') throw new RangeError('Invalid objective word answer');
    const progress = course.vocabProgress[answer.id] ??= empty(now);
    progress.reviewEvidence ??= {};
    const evidence = progress.reviewEvidence[mode] ??= { attempts: 0, correct: 0 };
    evidence.attempts++;
    if (answer.correct) evidence.correct++;
    progress.attempts++;
    if (answer.correct) progress.correct++;
    progress.lastAttemptAt = now;
  }
}

export function vocabularyCoverage(course, entries = words, now = Date.now()) {
  const allowed = entries.filter(entry => knownWords.has(entry.id));
  let introduced = 0, tested = 0, bidirectional = 0, due = 0, retained = 0;
  for (const word of allowed) {
    const progress = course.vocabProgress?.[word.id];
    if (!progress) continue;
    introduced++;
    if (progress.attempts) tested++;
    const verified = modes.every(mode => progress.reviewEvidence?.[mode]?.correct > 0);
    if (verified) bidirectional++;
    const card = course.cards?.[word.id];
    if (card?.due <= now) due++;
    if (verified && course.reviewAssessmentVersion === 2 && card?.step >= 3) retained++;
  }
  return { total: allowed.length, introduced, tested, bidirectional, due, retained };
}
