import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, phrases } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { newCourse, recordPractice, reviewQueue, saveReview, seededRandom } from '../dist/engine.mjs';
import { createReviewRound, reviewBatch, scoreReviewRound, ensureObjectiveReview } from '../dist/vocabulary-review.mjs';
import { introduceVocabulary, recordObjectiveVocabularyReview, vocabularyCoverage } from '../dist/vocabulary-progress.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { copy } from '../dist/copy.mjs';

const pool = [...words, ...phrases];
const day = 86_400_000;

function evaluate(round, correct = true) {
  return round.stages.flatMap(stage => stage.kind === 'choice'
    ? [{ id: stage.entry.id, direction: stage.direction, format: 'choice', correct }]
    : stage.sources.filter(entry => stage.gradedIds.includes(entry.id))
      .map(entry => ({ id: entry.id, direction: stage.direction, format: 'match', correct })));
}

test('review choice and matching is bidirectional for all 30 language pairs', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const entries of [words.slice(0, 4), phrases.slice(0, 4), [words[0]]]) {
      const round = createReviewRound(entries, pool, base, target, seededRandom(38));
      const ids = new Set(round.entries.map(entry => entry.id));
      assert.equal(round.entries.length, entries.length);
      assert.equal(round.total, entries.length * 4);
      assert.equal(round.stages.length, entries.length * 2 + 2);
      const choiceStages = round.stages.filter(stage => stage.kind === 'choice');
      assert.equal(choiceStages.length, entries.length * 2);
      for (const stage of choiceStages) {
        assert.equal(stage.from, stage.direction === 'forward' ? base : target);
        assert.equal(stage.to, stage.direction === 'forward' ? target : base);
        assert.ok(ids.has(stage.entry.id));
        assert.ok(stage.options.some(option => option.id === stage.entry.id));
        assert.ok(stage.options.filter(option => option.id !== stage.entry.id)
          .every(option => !ids.has(option.id)), 'no reviewed entry may be leaked as a distractor');
        assert.ok(stage.options.length >= 3);
        const displayed = stage.options.map(option => option.text[stage.to]);
        assert.equal(new Set(displayed).size, displayed.length, 'ambiguous choice ' + base + '>' + target);
      }
      const boards = round.stages.filter(stage => stage.kind === 'matching');
      assert.deepEqual(boards.map(board => board.direction), ['forward', 'reverse']);
      for (const board of boards) {
        assert.equal(board.from, board.direction === 'forward' ? base : target);
        assert.equal(board.to, board.direction === 'forward' ? target : base);
        assert.deepEqual(new Set(board.sources.map(entry => entry.id)), new Set(board.targets.map(entry => entry.id)));
        assert.deepEqual(new Set(board.gradedIds), ids);
        assert.ok(board.sources.length >= 2);
      }
      const answers = evaluate(round);
      assert.equal(answers.length, round.total);
      assert.deepEqual(scoreReviewRound(round.entries, answers), {
        correct: round.total, total: round.total, passed: entries.length,
        reviewed: round.entries.map(entry => ({ id: entry.id, correct: true }))
      });
    }
  }
});

test('a mistaken choice or matching pair prevents that entry advancing for the entire round', () => {
  const round = createReviewRound(words.slice(0, 4), pool, 'uz', 'ar', seededRandom(3));
  const evaluations = evaluate(round);
  const id = round.entries[0].id;
  evaluations.find(answer => answer.id === id && answer.direction === 'reverse' && answer.format === 'match').correct = false;
  const result = scoreReviewRound(round.entries, evaluations);
  assert.equal(result.correct, 15);
  assert.equal(result.passed, 3);
  assert.ok(result.reviewed.find(row => row.id === id && row.correct === false));
  assert.throws(() => scoreReviewRound(round.entries, evaluations.slice(0, -1)), RangeError);
  const current = newCourse(), now = 200_000_000;
  current.journey = { level: 8, evidence: {}, recent: {}, lastActivity: null };
  for (const word of round.entries) current.cards[word.id] = { step: 2, due: now };
  recordObjectiveVocabularyReview(current, evaluations, now);
  for (const reviewed of result.reviewed) saveReview(current, reviewed.id, reviewed.correct, now);
  assert.equal(current.cards[id].step, -1);
  assert.equal(current.cards[id].due, now + 600_000);
  assert.equal(result.reviewed.filter(item => current.cards[item.id].step === 3).length, 3);
  assert.equal(vocabularyCoverage(current, round.entries).bidirectional, 3);
});

test('a mere lesson question cannot advance an overdue item: objective review is required', () => {
  const current = newCourse(), now = 800_000_000;
  const word = words[0];
  current.cards[word.id] = { step: 1, due: now };
  recordPractice(current, [{ id: word.id, correct: true, skill: 'recognition', scored: true }], now);
  assert.deepEqual(current.cards[word.id], { step: 1, due: now });
  recordPractice(current, [{ id: word.id, correct: false }], now);
  assert.equal(current.cards[word.id].step, -1);
  assert.equal(reviewQueue({ ...current, journey: { level: 8 } }, false, now)[0].id, word.id);
});

test('legacy self-rated cards are requeued, history retained but not counted as bidirectional mastery', () => {
  const now = 1_700_000_000_000, word = words[0], phrase = phrases[0];
  const legacy = {
    best: {}, cards: { [word.id]: { step: 4, due: now + 30 * day },
      [phrase.id]: { step: 2, due: now + 7 * day } },
    vocabProgress: { [word.id]: { introducedAt: now - day, attempts: 1, correct: 1,
      recallAttempts: 12, recallCorrect: 11, lastAttemptAt: now - day } }
  };
  const initial = validateState({ base: 'uz', target: 'ar', courses: { 'uz>ar': legacy } }).courses['uz>ar'];
  assert.equal(ensureObjectiveReview(initial, now), true);
  assert.equal(ensureObjectiveReview(initial, now + day), false);
  assert.deepEqual(initial.cards[word.id], { step: -1, due: now });
  assert.deepEqual(initial.cards[phrase.id], { step: -1, due: now });
  assert.equal(initial.vocabProgress[word.id].recallCorrect, 11); // compatibility, never used for mastery
  assert.equal(vocabularyCoverage(initial, [word], now).bidirectional, 0);
  assert.equal(vocabularyCoverage(initial, [word], now).retained, 0);
  const saved = validateState({ base: 'uz', target: 'ar', courses: { 'uz>ar': initial } });
  assert.equal(saved.courses['uz>ar'].reviewAssessmentVersion, 2);
  assert.deepEqual(saved.courses['uz>ar'].cards, initial.cards);
});

test('every reviewed word collects all four objective evidence types and persists them', () => {
  const now = 1_700_000_000_000;
  const current = newCourse(), items = words.slice(0, 4);
  introduceVocabulary(current, items, now);
  const round = createReviewRound(items, pool, 'uz', 'ar', seededRandom(6));
  const results = evaluate(round);
  recordObjectiveVocabularyReview(current, results, now + day);
  const coverage = vocabularyCoverage(current, items, now + day);
  assert.deepEqual(coverage, { total: 4, introduced: 4, tested: 4, bidirectional: 4, due: 4, retained: 0 });
  for (const item of items) {
    const evidence = current.vocabProgress[item.id].reviewEvidence;
    for (const mode of ['forwardChoice', 'reverseChoice', 'forwardMatch', 'reverseMatch']) {
      assert.deepEqual(evidence[mode], { attempts: 1, correct: 1, lastCorrect: true });
    }
  }
  const saved = validateState({ base: 'uz', target: 'ar', courses: { 'uz>ar': current } });
  assert.deepEqual(saved.courses['uz>ar'].vocabProgress, current.vocabProgress);
  assert.throws(() => validateState({ base: 'uz', target: 'ar', courses: { 'uz>ar': {
    ...current, vocabProgress: { [items[0].id]: { ...current.vocabProgress[items[0].id],
      reviewEvidence: { invalid: { attempts: 1, correct: 1 } } } }
  } } }));
});


test('a later wrong objective answer removes bidirectional verification', () => {
  const current = newCourse(), now = 1_700_000_000_000;
  const word = words[0];
  introduceVocabulary(current, [word], now);
  for (const direction of ['forward','reverse']) for (const format of ['choice','match'])
    recordObjectiveVocabularyReview(current, [{ id: word.id, direction, format, correct: true }], now + day);
  assert.equal(vocabularyCoverage(current, [word]).bidirectional, 1);
  recordObjectiveVocabularyReview(current, [{ id: word.id, direction: 'reverse', format: 'choice', correct: false }], now + day + 1);
  assert.equal(vocabularyCoverage(current, [word]).bidirectional, 0);
  assert.equal(current.vocabProgress[word.id].reviewEvidence.reverseChoice.lastCorrect, false);
});

test('early successful tests do not accelerate spacing, but objective mistakes reset the interval', () => {
  const now = 1_700_000_000_000, current = newCourse();
  current.cards[words[0].id] = { step: 2, due: now + 7 * day };
  saveReview(current, words[0].id, true, now);
  assert.deepEqual(current.cards[words[0].id], { step: 2, due: now + 7 * day });
  saveReview(current, words[0].id, false, now);
  assert.deepEqual(current.cards[words[0].id], { step: -1, due: now + 600_000 });
});


test('objective-review UI copy exists in all six interface languages', () => {
  for (const language of codes) for (const key of [
    'objectiveReviewLead', 'objectiveChoiceInstruction', 'objectiveMatchInstruction',
    'objectiveReviewResult', 'objectiveReviewAllCorrect', 'vocabularyExposureStats'
  ]) assert.ok(copy[language][key]?.trim(), language + ' ' + key);
});
