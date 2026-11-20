import { makeQuestion, shuffled } from './engine.mjs';
import { practiceQuestion } from './practice.mjs';
import { lessonVocabularyGroups, needsSupport } from './journey.mjs';
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

// Preview all lesson phrases before testing, so learners have a predictable
// sequence and no hidden subscore or special withholding rule.
function intro(entry, examples) {
  return { task: 'intro', entry, examples, core: false };
}

// Keep each vocabulary preview card within one topic group and at most eight
// words, so unrelated groups are never mixed on one screen and oversized single
// groups split evenly into compact cards.
function wordIntroChunks(groups, max = 8) {
  return groups.flatMap(group => {
    const entries = group.words;
    if (!entries?.length) return [];
    const count = Math.ceil(entries.length / max);
    return Array.from({ length: count }, (_, index) =>
      entries.slice(
        Math.floor(index * entries.length / count),
        Math.floor((index + 1) * entries.length / count)
      )
    );
  });
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
  const writeTask = () => ({
    task: 'write', entry: writingEntry, core: true, openEnded: false, from: base, to: target,
    wordBank: makeWordBank(writingEntry, target, random, unit.phrases)
  });
  const writingTask = writingEntry ? writeTask() : objective(unit, phrases[3], base, target, random);
  const dictationTask = dictationEntry
    ? { task: 'dictation', entry: dictationEntry, core: true, from: target, to: target,
        wordBank: makeWordBank(dictationEntry, target, random, unit.phrases) }
    : { ...practiceQuestion('listen', phrases[1], 1, base, target, random), core: true };
  // The lesson's share of the level's vocabulary, presented in group-aligned
  // cards of at most eight words before the question that asks about one of
  // them, so no word is tested before it is taught.
  const vocabularyGroups = lessonVocabularyGroups(unit);
  const vocabulary = vocabularyGroups.flatMap(group => group.words);
  const vocabularyCards = vocabulary.length >= 1
    ? [...wordIntroChunks(vocabularyGroups).map(chunk => ({
         task: 'word-intro', entry: chunk[0], examples: chunk, core: false
       })),
       { ...practiceQuestion('words', choose(vocabulary, random), 0, base, target, random),
         task: 'word-meaning', core: true }]
    : [objective(unit, phrases[3], base, target, random)];
  const lesson = [
    intro(phrases[0], [...unit.phrases, ...(unit.examples ?? [])]),
    objective(unit, phrases[0], base, target, random),
    { ...practiceQuestion('listen', phrases[1], 1, base, target, random), core: true },
    { ...practiceQuestion('gap', phrases[2], 2, base, target, random), core: true },
    writingTask,
    objective(unit, phrases[4], base, target, random, 'reverse-translation'),
    dictationTask,
    { task: 'speak', entry: phrases[0], core: false },
    ...vocabularyCards,
    objective(unit, phrases[phrases.length - 1], base, target, random, 'final-choice')
  ];
  // Target an observable weakness with a scored, objectively graded question. Its inclusion is
  // reflected in the displayed total and the 80% passing threshold.
  if (needsSupport(course, 'listening')) {
    lesson.splice(-1, 0, { ...practiceQuestion('listen', choose(phrases, random), 0, base, target, random), core: true });
  } else if (needsSupport(course, 'recall')) {
    lesson.splice(-1, 0, writingEntry ? writeTask() : objective(unit, phrases[2], base, target, random));
  } else if (needsSupport(course, 'reading')) {
    lesson.splice(-1, 0, { ...objective(unit, phrases[2], base, target, random, 'reading-practice'), core: true });
  }
  if (lessonQuestionTotal(lesson) < 1 || lesson.some(task => task.core !== isQuestion(task))) {
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

function activeLanguages(activities) {
  for (const item of activities) {
    if (item.from && item.to && item.from !== item.to) return [item.from, item.to].sort();
  }
  return null;
}

// Structural and content fingerprint of a freshly built lesson (before any
// recovery cards are inserted) for the active language pair. Comparing this on
// reload lets unaffected lessons resume while lessons whose sequence, adaptive
// question, or displayed wording changed restart cleanly at the preview.
export function lessonSequenceSignature(activities) {
  if (!Array.isArray(activities)) return '';
  const pair = activeLanguages(activities);
  const entrySignature = entry => {
    if (!entry?.id) return '';
    if (!pair || !entry.text) return entry.id;
    return `${entry.id}=${entry.text[pair[0]] ?? ''}/${entry.text[pair[1]] ?? ''}`;
  };
  return activities.map(item =>
    `${item.task}:${entrySignature(item.studyEntry ?? item.entry)}:${item.examples ? item.examples.map(entrySignature).join(',') : ''}`
  ).join('|');
}

// Replays saved mid-lesson answers over a freshly built activity list,
// re-inserting the same recovery cards produced by incorrect scored answers.
// Returns null whenever the saved sequence no longer lines up (e.g. a changed
// catalog or pre-split session) so the caller can discard and restart cleanly.
export function replaySavedLesson(saved, initialQuestions) {
  if (!saved || !Array.isArray(saved.answers) || !Array.isArray(initialQuestions)) return null;
  const expectedSignature = lessonSequenceSignature(initialQuestions);
  if (!saved.signature || saved.signature !== expectedSignature) return null;
  const questions = [...initialQuestions];
  const answers = [];
  let recoveries = 0;
  for (const answer of saved.answers) {
    const question = questions[answers.length];
    const entry = question && (question.studyEntry ?? question.entry);
    if (!entry || entry.id !== answer?.id || Boolean(answer?.scored) !== Boolean(question.core) ||
        (answer.task !== undefined && answer.task !== question.task)) {
      return null;
    }
    answers.push(answer);
    if (question.core && !answer.correct && recoveries < 2) {
      questions.splice(answers.length, 0, recoveryActivity(question));
      recoveries++;
    }
  }
  if (!answers.length || answers.length >= questions.length) return null;
  return { questions, answers, index: answers.length, recoveries, signature: expectedSignature };
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
