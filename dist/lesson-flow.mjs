import { makeQuestion, shuffled } from './engine.mjs';
import { practiceQuestion, canOrder } from './practice.mjs';
import { needsSupport } from './journey.mjs';
import { matchesReference } from './skill-lab.mjs';
import { makeWordBank } from './word-bank.mjs';

// One shared curriculum-backed activity sequence for all 56 lessons.
// Five deterministic core questions preserve the existing 4/5 completion gate.
// All other modalities are formative and must not fail a learner because their
// browser has no voice or microphone, or because wording differs from a model.
export const lessonCoreTotal = 5;
export const lessonPassingScore = 4;

function choose(entries, random) {
  return entries[Math.floor(random() * entries.length)];
}

function objective(unit, entry, base, target, random, type = 'translation') {
  return {
    ...makeQuestion(unit.phrases, entry, 0, base, target, random),
    task: type, core: true, from: target, to: base
  };
}

function reader(unit, entry, context, base, target, random) {
  return { ...objective(unit, entry, base, target, random, 'context-reading'), context };
}

function intro(entry, pair) {
  return { task: 'intro', entry, examples: pair, core: false };
}

export function buildLessonActivities(unit, course, base, target, random = Math.random) {
  if (!unit?.id || !Number.isInteger(unit.level) || !unit.phrases?.length ||
      base === target || !unit.phrases.every(item => item.text[base] && item.text[target])) {
    throw new RangeError('Invalid lesson or language direction');
  }
  const phrases = shuffled(unit.phrases, random);
  if (phrases.length < 5) throw new RangeError('Lesson requires at least five phrases');
  const writingEntry = [...phrases].sort((a, b) => b.text[target].trim().split(/\s+/u).length - a.text[target].trim().split(/\s+/u).length)[0];
  const wordOrder = phrases.find(item => canOrder(item, target));
  const order = wordOrder
    ? { ...practiceQuestion('order', wordOrder, 0, base, target, random), core: true }
    : objective(unit, phrases[3], base, target, random);
  const lesson = [
    intro(phrases[0], phrases.slice(0, 2)),
    objective(unit, phrases[0], base, target, random),
    { ...practiceQuestion('listen', phrases[1], 1, base, target, random), core: false },
    { ...practiceQuestion('gap', phrases[2], 2, base, target, random), core: true },
    reader(unit, phrases[3], phrases[2], base, target, random),
    { task: 'write', entry: writingEntry, core: false, openEnded: false, wordBank: makeWordBank(writingEntry, target, random) },
    order,
    { task: 'dictation', entry: phrases[1], core: false, from: target, to: target, wordBank: makeWordBank(phrases[1], target, random) },
    { task: 'speak', entry: phrases[0], core: false, openEnded: unit.level >= 5, context: unit.description },
    objective(unit, phrases[phrases.length - 1], base, target, random, 'final-choice')
  ];
  // Target an observable weakness without replacing any essential activity.
  // Extra practice is formative and cannot increase or lower lesson pass marks.
  if (needsSupport(course, 'listening')) {
    lesson.splice(-1, 0, { ...practiceQuestion('listen', choose(phrases, random), 0, base, target, random), core: false });
  } else if (needsSupport(course, 'recall')) {
    lesson.splice(-1, 0, { task: 'write', entry: writingEntry, core: false, openEnded: false, wordBank: makeWordBank(writingEntry, target, random) });
  } else if (needsSupport(course, 'reading')) {
    lesson.splice(-1, 0, { ...reader(unit, phrases[2], phrases[1], base, target, random), core: false });
  }
  if (lesson.filter(task => task.core).length !== lessonCoreTotal) throw new Error('Invalid lesson core');
  return lesson;
}

// A recovery card is added *after* an incorrect core answer. It shows both
// languages, encourages recall and never contributes to the scored five tasks.
export function recoveryActivity(question) {
  const entry = question.studyEntry ?? question.entry;
  return { task: 'recovery', core: false, entry };
}

export function lessonScore(questions, answers) {
  if (answers.length !== questions.length) throw new RangeError('Incomplete lesson');
  const assessed = questions.filter(question => question.core);
  const correct = questions.reduce((score, question, index) =>
    score + Number(Boolean(question.core && answers[index]?.correct)), 0);
  if (assessed.length !== lessonCoreTotal) throw new RangeError('Invalid scored task count');
  return { correct, total: lessonCoreTotal, passed: correct >= lessonPassingScore };
}

export function lessonReferenceMatch(entered, entry, target) {
  return matchesReference(entered, entry.text[target], target);
}
