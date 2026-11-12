import { makeQuestion, searchText, shuffled } from './engine.mjs';
import { checkpointQuestionCount, dueForLevel, journeyFor, path, workingLevel } from './journey.mjs';
import { makeWordBank, tileWords, writingPhrases } from './word-bank.mjs';
import { readingAid, wordAid } from './reading-aid.mjs';
import { lessonExchanges } from './dialogues.mjs';

export const modes = {
  translation: { icon: 'swap', tone: 'lilac' },
  words: { icon: 'vocabulary', tone: 'mint' },
  gap: { icon: 'gap', tone: 'sand' },
  listen: { icon: 'volume', tone: 'peach' },
  match: { icon: 'match', tone: 'lilac' },
  reply: { icon: 'chat', tone: 'sky' }
};

// One shared sequence for all practice cards. Special skills and standard
// exercise modes deliberately share one grid rather than separate sections.
export const practiceCardOrder = [
  ['mode', 'translation'], ['mode', 'words'], ['skill', 'listening'],
  ['mode', 'gap'], ['skill', 'writing'], ['mode', 'listen'],
  ['skill', 'speaking'], ['mode', 'match'], ['mode', 'reply'], ['checkpoint', 'checkpoint']
];

const size = 6;

function randomItem(entries, random) {
  return entries[Math.floor(random() * entries.length)];
}

function wordTokens(text) {
  return [...text.matchAll(/[\p{L}\p{M}]+(?:[’‘'-][\p{L}\p{M}]+)*/gu)];
}

// Multiword phrases, so a gap still leaves some of the sentence as context.
export function gapCandidates(entries, target) {
  const multiword = entries.filter(entry => wordTokens(entry.text[target]).length > 1);
  return multiword.length ? multiword : entries;
}

function gapQuestion(entry, group, target, random) {
  const phrase = entry.text[target];
  const tokens = wordTokens(phrase);
  const capitalised = word => /^\p{Lu}/u.test(word);
  // tileWords lower-cases a word that is only capitalised because it opens its
  // own sentence, so no option stands out by its case alone.
  // Each candidate keeps the reading aid for its own word, so an option in a
  // script the learner is still learning is not a bare shape.
  const aidFor = new Map();
  const pool = group.filter(item => item !== entry).flatMap(item => {
    const itemWords = tileWords(item.text[target], target);
    const itemAid = readingAid(item, target);
    itemWords.forEach((word, index) => {
      const roman = wordAid(word, target, itemAid, index);
      if (roman && !aidFor.has(word)) aidFor.set(word, roman);
    });
    return itemWords;
  }).filter(word => word.length > 1);
  const entryAid = readingAid(entry, target);
  const option = (id, text, roman) => roman ? { id, text: { [target]: text }, romanization: roman } : { id, text: { [target]: text } };
  // The opening word of a sentence carries a capital letter, so it is gapped
  // only in a one-word phrase. Among the rest, prefer a word whose
  // capitalisation another option can share, so that a capital letter (a German
  // noun or an English weekday, say) never points to the answer on its own.
  const candidates = tokens.slice(tokens.length > 1 ? 1 : 0);
  const shared = candidates.filter(([word]) => pool.some(other =>
    capitalised(other) === capitalised(word) && searchText(other) !== searchText(word)));
  const token = (shared.length ? shared : candidates)
    .reduce((longest, current) => current[0].length > longest[0].length ? current : longest);
  const correct = option('gap-correct', token[0], wordAid(token[0], target, entryAid, tokens.indexOf(token)));
  const seen = new Set([searchText(token[0])]);
  const choices = [correct];
  const matching = word => capitalised(word) === capitalised(token[0]);
  const distractors = shuffled(pool, random)
    .sort((first, second) => Number(matching(second)) - Number(matching(first)));
  for (const candidate of distractors) {
    const key = searchText(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    choices.push(option('gap-' + choices.length, candidate, aidFor.get(candidate)));
    if (choices.length === 4) break;
  }
  return {
    task: 'gap', entry: correct, studyEntry: entry, to: target, from: target,
    gap: { before: phrase.slice(0, token.index), after: phrase.slice(token.index + token[0].length) },
    options: shuffled(choices, random)
  };
}

const questionGroups = new Map(path.flatMap(step => [
  ...step.units.map(unit => unit.phrases),
  ...step.wordGroups.map(group => group.words)
]).flatMap(entries => entries.map(entry => [entry.id, entries])));

export function practiceSkill(mode) {
  if (mode === 'listen') return 'listening';
  return 'recognition';
}

export function practiceQuestion(mode, entry, index, base, target, random) {
  if (!['translation', 'words', 'gap', 'listen'].includes(mode)) {
    throw new RangeError('Unknown practice question mode');
  }
  const group = questionGroups.get(entry.id);
  if (mode === 'gap') return gapQuestion(entry, group, target, random);
  if (mode === 'listen') return { ...makeQuestion(group, entry, 0, base, target, random), task: 'listen' };
  return makeQuestion(group, entry, index, base, target, random);
}

function nearbySteps(level, maxLevel) {
  return path.filter(step => step.level <= maxLevel)
    .sort((first, second) => Math.abs(first.level - level) - Math.abs(second.level - level));
}

export function practiceQuestions(mode, course, base, target, random = Math.random) {
  if (!Object.hasOwn(modes, mode) || ['match', 'reply'].includes(mode)) throw new RangeError('Unknown practice mode');
  const level = workingLevel(course, practiceSkill(mode));
  const entries = nearbySteps(level, journeyFor(course).level).flatMap(step => shuffled(
    mode === 'words' ? step.wordGroups.flatMap(group => group.words) : step.phrases,
    random
  ));
  const pool = mode === 'gap' ? gapCandidates(entries, target) : entries;
  return pool.slice(0, size).map((entry, index) => practiceQuestion(mode, entry, index, base, target, random));
}

export function mixedQuestions(course, base, target, random = Math.random, now = Date.now()) {
  const journey = journeyFor(course);
  const current = path[journey.level - 1];
  const due = dueForLevel(course, now).slice(0, 2);
  const used = new Set(due.map(entry => entry.id));
  const priority = entry => journey.evidence[entry.id] === 1 ? 0 : journey.evidence[entry.id] ? 2 : 1;
  // Earlier levels keep their turn, so a learner who has reached the end of the
  // path is not left circling the forty-two phrases of the level they finished on.
  const revisit = shuffled(path.filter(step => step.level < journey.level)
    .flatMap(step => step.phrases).filter(entry => !used.has(entry.id)), random)
    .slice(0, Math.min(2, journey.level - 1));
  for (const entry of revisit) used.add(entry.id);
  const near = shuffled(current.phrases.filter(entry => !used.has(entry.id)), random)
    .sort((first, second) => priority(first) - priority(second))
    .slice(0, size - 1 - due.length - revisit.length);
  const nearModes = ['gap', 'listen', 'translation'];
  const multiword = near.findIndex(entry => wordTokens(entry.text[target]).length > 1);
  if (multiword > 0) [near[0], near[multiword]] = [near[multiword], near[0]];
  const questions = [...due, ...revisit].map((entry, index) => practiceQuestion('translation', entry, index, base, target, random));
  for (const [index, entry] of near.entries()) {
    const mode = nearModes[index] ?? 'translation';
    questions.push(practiceQuestion(mode, entry, questions.length, base, target, random));
    used.add(entry.id);
  }
  const stretch = randomItem(gapCandidates(current.phrases.filter(entry => !used.has(entry.id)), target), random);
  questions.push(practiceQuestion('gap', stretch, questions.length, base, target, random));
  return questions;
}

// Two questions per level, in level order, from two different lessons of that level.
export function placementQuestions(base, target, random = Math.random) {
  return path.flatMap(step => shuffled(step.units, random).slice(0, 2)).map((unit, index) =>
    practiceQuestion('translation', randomItem(unit.phrases, random), index, base, target, random)
  );
}

// Sentence building from the base-language meaning, as in a lesson's writing task.
export function writingQuestion(unit, entry, base, target, random = Math.random) {
  return { task: 'write', entry, from: base, to: target, wordBank: makeWordBank(entry, target, random, unit.phrases) };
}

// One phrase from every lesson, plus a second pass and vocabulary from four
// different groups. Two lessons are tested by building their writing sentence
// from word tiles. Tests stay at the chosen level and vary on each attempt.
export function checkpointQuestions(level, base, target, random = Math.random) {
  const step = path[level - 1];
  if (!Number.isInteger(level) || !step) throw new RangeError('Invalid test level');
  const tasks = ['translation', 'gap', 'write', 'translation', 'translation', 'gap', 'write', 'translation'];
  const lessons = shuffled(step.units, random);
  const plan = lessons.map((unit, index) => {
    const writing = tasks[index] === 'write' && writingPhrases(unit.phrases, target)[0];
    return writing ? { unit, entry: writing, task: 'write' }
      : { unit, entry: randomItem(tasks[index] === 'gap' ? gapCandidates(unit.phrases, target) : unit.phrases, random),
          task: tasks[index] === 'write' ? 'translation' : tasks[index] };
  });
  const used = new Set(plan.map(item => item.entry.id));
  for (const entry of shuffled(step.phrases.filter(entry => !used.has(entry.id)), random).slice(0, 8 - plan.length)) {
    plan.push({ unit: step.units.find(unit => unit.phrases.includes(entry)), entry, task: tasks[plan.length] });
  }
  const questions = plan.map(({ unit, entry, task }, index) => task === 'write'
    ? writingQuestion(unit, entry, base, target, random)
    : practiceQuestion(task, entry, index, base, target, random));
  for (const group of shuffled(step.wordGroups, random).slice(0, 4)) {
    questions.push(makeQuestion(group.words, randomItem(group.words, random), questions.length, base, target, random));
  }
  return shuffled(questions, random);
}

// Conversation practice: a line from a lesson, and which of that lesson's other
// lines comes next. The wrong answers are the lesson's own phrases, so the
// choice is about what fits the exchange rather than what the words mean.
export function replyQuestions(course, base, target, random = Math.random) {
  const level = workingLevel(course, 'recognition');
  const pool = nearbySteps(level, journeyFor(course).level)
    .flatMap(step => shuffled(step.units, random))
    .flatMap(unit => lessonExchanges(unit).map(pair => ({ unit, ...pair })));
  return pool.slice(0, size).map(({ unit, cue, reply }) => {
    const others = shuffled(unit.phrases.filter(entry => entry !== reply && entry !== cue), random).slice(0, 3);
    return {
      task: 'reply', cue, entry: reply, from: target, to: target,
      options: shuffled([reply, ...others], random)
    };
  });
}

export function readingQuestions(story, base, random = Math.random) {
  return story.questions.map(({ prompt, choices }, index) => {
    const answers = choices.map((text, choice) => ({ id: story.id + '-' + index + '-' + choice, text }));
    return { task: 'reading', prompt: prompt[base], entry: answers[0], options: shuffled(answers, random), from: base, to: base };
  });
}

export function matchRound(course, random = Math.random) {
  const level = workingLevel(course, 'recognition');
  const group = randomItem(path[level - 1].wordGroups, random);
  const entries = shuffled(group.words, random).slice(0, 5);
  return { group, baseCards: shuffled(entries, random), targetCards: shuffled(entries, random) };
}

export function normalizeSpelling(text, language) {
  let clean = text.trim().normalize('NFC').toLocaleLowerCase(language).replace(/[‘’ʻʼ]/g, "'");
  if (language === 'ar') clean = clean.replace(/[\p{M}ـ]/gu, '');
  return clean;
}
