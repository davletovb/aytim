import { makeQuestion, shuffled } from './engine.mjs';
import { practiceQuestion } from './practice.mjs';
import { lessonVocabulary, needsSupport } from './journey.mjs';
import { matchesReference } from './skill-lab.mjs';
import { makeWordBank, writingPhrases } from './word-bank.mjs';

// Every answerable activity contributes to the lesson score. Intro and review
// cards provide guidance but are never graded or shown as numbered questions.
// Speaking uses transcript comparison as practice feedback, not a pass-mark.
const isQuestion = activity => !['intro', 'word-intro', 'recovery', 'speak'].includes(activity.task);
export const lessonQuestionTotal = activities => activities.filter(isQuestion).length;
export const lessonPassingScore = total => {
  if (!Number.isSafeInteger(total) || total < 1) throw new RangeError('Invalid lesson question count');
  return Math.ceil(total * 0.8);
};

// The introduction and optional mistake-review cards are instruction screens,
// not questions. Keeping them out of the count also prevents the progress bar
// denominator from changing when a recovery card is inserted after a mistake.
export function lessonQuestionProgress(activities, index) {
  if (!Array.isArray(activities) || index < 0 || index >= activities.length ||
      !isQuestion(activities[index])) return null;
  return {
    step: activities.slice(0, index + 1).filter(isQuestion).length,
    total: lessonQuestionTotal(activities)
  };
}

function choose(entries, random) {
  return entries[Math.floor(random() * entries.length)];
}

function objective(unit, entry, base, target, random, type = 'translation') {
  return {
    ...makeQuestion(unit.phrases, entry, type === 'reverse-translation' ? 1 : 0, base, target, random),
    task: type, core: true
  };
}

// Preview familiar phrases; deliberately reserve a small number for first-encounter
// controlled production. These are not claims of independent free-form fluency.
function intro(entry, examples) {
  return { task: 'intro', entry, examples, core: false };
}

export function buildLessonActivities(unit, course, base, target, random = Math.random) {
  if (!unit?.id || !Number.isInteger(unit.level) || !unit.phrases?.length ||
      base === target || !unit.phrases.every(item => item.text[base] && item.text[target])) {
    throw new RangeError('Invalid lesson or language direction');
  }
  const phrases = shuffled(unit.phrases, random);
  if (phrases.length < 5) throw new RangeError('Lesson requires at least five phrases');
  // Never show a single-tile ordering exercise. Writing uses the lesson's longest
  // phrase (ties in lesson order), whose accepted word orders are listed in word-orders.mjs.
  const bankEntries = writingPhrases(unit.phrases, target);
  const writingEntry = bankEntries[0];
  const dictationEntry = bankEntries.find(entry => entry.id !== writingEntry?.id) ?? writingEntry;
  const withheld = new Set([writingEntry?.id, dictationEntry?.id].filter(Boolean));
  const familiar = phrases.filter(entry => !withheld.has(entry.id));
  const samples = familiar.length >= 3 ? familiar : phrases;
  // Two previously unseen source phrases test word-bank reconstruction rather
  // than recognition of translations immediately shown in the introduction.
  const writeTask = (firstEncounter = true) => ({
    task: 'write', entry: writingEntry, core: true, openEnded: false, from: base, to: target,
    firstEncounter, wordBank: makeWordBank(writingEntry, target, random, unit.phrases)
  });
  const writingTask = writingEntry ? writeTask() : objective(unit, phrases[3], base, target, random);
  const dictationTask = dictationEntry
    ? { task: 'dictation', entry: dictationEntry, core: true, from: target, to: target,
        firstEncounter: dictationEntry.id !== writingEntry?.id,
        wordBank: makeWordBank(dictationEntry, target, random, unit.phrases) }
    : { ...practiceQuestion('listen', phrases[1], 1, base, target, random), core: true };
  // The lesson's share of the level's vocabulary, presented before the one
  // question that asks about it, so no word is tested before it is taught.
  const vocabulary = lessonVocabulary(unit);
  const vocabularyCards = vocabulary.length >= 1
    ? [{ task: 'word-intro', entry: vocabulary[0], examples: vocabulary, core: false },
       { ...practiceQuestion('words', choose(vocabulary, random), 0, base, target, random),
         task: 'word-meaning', core: true }]
    : [objective(unit, phrases[3], base, target, random)];
  const lesson = [
    intro(samples[0], samples),
    objective(unit, samples[0], base, target, random),
    { ...practiceQuestion('listen', samples[1], 1, base, target, random), core: true },
    { ...practiceQuestion('gap', samples[2], 2, base, target, random), core: true },
    writingTask,
    objective(unit, samples[3] ?? samples[0], base, target, random, 'reverse-translation'),
    dictationTask,
    { task: 'speak', entry: samples[0], core: false },
    ...vocabularyCards,
    objective(unit, samples[samples.length - 1], base, target, random, 'final-choice')
  ];
  // Target an observable weakness with a scored, objectively graded question. Its inclusion is
  // reflected in the displayed total and the 80% passing threshold.
  if (needsSupport(course, 'listening')) {
    lesson.splice(-1, 0, { ...practiceQuestion('listen', choose(phrases, random), 0, base, target, random), core: true });
  } else if (needsSupport(course, 'recall')) {
    lesson.splice(-1, 0, writingEntry ? writeTask(false) : objective(unit, samples[2], base, target, random));
  } else if (needsSupport(course, 'reading')) {
    lesson.splice(-1, 0, { ...objective(unit, phrases[2], base, target, random, 'reading-practice'), core: true });
  }
  if (lessonQuestionTotal(lesson) < 1 || lesson.some(task => task.core !== isQuestion(task)) ||
      lesson.some(task => task.firstEncounter && samples.some(entry => entry.id === task.entry.id))) {
    throw new Error('Invalid lesson questions');
  }
  return lesson;
}

// A recovery card is added after an incorrect answer. It shows both
// languages and encourages recall, but is not a question or a graded item.
export function recoveryActivity(question) {
  const entry = question.studyEntry ?? question.entry;
  return { task: 'recovery', core: false, entry };
}

export function lessonScore(questions, answers) {
  if (answers.length !== questions.length) throw new RangeError('Incomplete lesson');
  if (questions.some(question => question.core !== isQuestion(question))) {
    throw new RangeError('Invalid scored question');
  }
  const total = lessonQuestionTotal(questions);
  const correct = questions.reduce((score, question, index) =>
    score + Number(Boolean(isQuestion(question) && answers[index]?.correct)), 0);
  return { correct, total, passed: correct >= lessonPassingScore(total) };
}

export function lessonReferenceMatch(entered, entry, target) {
  return matchesReference(entered, entry.text[target], target);
}

/** Separately report new-within-this-lesson constrained production.
 * These tasks still use supplied tiles/audio and do NOT prove spontaneous
 * speaking, sentence creation, or cross-context grammatical generalization.
 */
export function lessonFirstEncounterScore(questions, answers) {
  if (answers.length !== questions.length) throw new RangeError('Incomplete lesson');
  let correct = 0, total = 0;
  questions.forEach((question, index) => {
    if (!question.firstEncounter || !question.core) return;
    total++;
    if (answers[index]?.correct) correct++;
  });
  return { correct, total };
}
