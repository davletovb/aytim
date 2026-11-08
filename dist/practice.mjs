import { makeQuestion, searchText, shuffled } from './engine.mjs';
import { dueForLevel, journeyFor, needsSupport, path, workingLevel } from './journey.mjs';

export const modes = {
  translation: { icon: 'swap', tone: 'lilac' },
  words: { icon: 'vocabulary', tone: 'mint' },
  gap: { icon: 'gap', tone: 'sand' },
  order: { icon: 'order', tone: 'sky' },
  listen: { icon: 'volume', tone: 'peach' },
  spelling: { icon: 'pen', tone: 'rose' },
  match: { icon: 'match', tone: 'lilac' }
};

const size = 6;

function randomItem(entries, random) {
  return entries[Math.floor(random() * entries.length)];
}

function wordTokens(text) {
  return [...text.matchAll(/[\p{L}\p{M}]+(?:[’‘'-][\p{L}\p{M}]+)*/gu)];
}

function gapQuestion(entry, group, target, task, random) {
  const phrase = entry.text[target];
  const token = wordTokens(phrase).reduce((longest, current) => current[0].length > longest[0].length ? current : longest);
  const correct = { id: 'gap-correct', text: { [target]: token[0] } };
  const seen = new Set([searchText(token[0])]);
  const choices = [correct];
  const distractors = shuffled(group.filter(item => item !== entry).flatMap(item => wordTokens(item.text[target])), random);
  for (const [candidate] of distractors) {
    const key = searchText(candidate);
    if (candidate.length < 2 || seen.has(key)) continue;
    seen.add(key);
    choices.push({ id: 'gap-' + choices.length, text: { [target]: candidate } });
    if (choices.length === 4) break;
  }
  return {
    task, entry: correct, studyEntry: entry, to: target, from: target,
    gap: { before: phrase.slice(0, token.index), after: phrase.slice(token.index + token[0].length) },
    options: task === 'gap' ? shuffled(choices, random) : undefined
  };
}

function sentenceParts(text) {
  return text.split(/\s+/);
}

function orderQuestion(entry, target, random) {
  const tokens = sentenceParts(entry.text[target]).map((text, index) => ({ text, id: String(index) }));
  const tray = shuffled(tokens, random);
  if (tray.every((token, index) => token.text === tokens[index].text)) tray.push(tray.shift());
  return { task: 'order', entry, to: target, from: target, tray };
}

const questionGroups = new Map(path.flatMap(step => [
  ...step.units.map(unit => unit.phrases),
  ...step.wordGroups.map(group => group.words)
]).flatMap(entries => entries.map(entry => [entry.id, entries])));

export function practiceSkill(mode) {
  if (mode === 'listen') return 'listening';
  if (mode === 'spelling' || mode === 'order') return 'recall';
  return 'recognition';
}

function canOrder(entry, target) {
  const count = sentenceParts(entry.text[target]).length;
  return count >= 3 && count <= 12;
}

function practiceQuestion(mode, entry, index, base, target, random) {
  const group = questionGroups.get(entry.id);
  if (mode === 'gap' || mode === 'spelling') return gapQuestion(entry, group, target, mode, random);
  if (mode === 'order') return orderQuestion(entry, target, random);
  if (mode === 'listen') return { ...makeQuestion(group, entry, 0, base, target, random), task: 'listen' };
  return makeQuestion(group, entry, index, base, target, random);
}

function nearbySteps(level) {
  return [...path].sort((first, second) => Math.abs(first.level - level) - Math.abs(second.level - level));
}

export function practiceQuestions(mode, course, base, target, random = Math.random) {
  const level = workingLevel(course, practiceSkill(mode));
  const entries = nearbySteps(level).flatMap(step => shuffled(
    mode === 'words' ? step.wordGroups.flatMap(group => group.words) : step.phrases,
    random
  ));
  const eligible = mode === 'order' ? entries.filter(entry => canOrder(entry, target)) : entries;
  return eligible.slice(0, size).map((entry, index) => practiceQuestion(mode, entry, index, base, target, random));
}

export function mixedQuestions(course, base, target, random = Math.random, now = Date.now()) {
  const journey = journeyFor(course);
  const current = path[journey.level - 1];
  const next = path[journey.level];
  const due = dueForLevel(course, now).slice(0, 2);
  const used = new Set(due.map(entry => entry.id));
  const priority = entry => journey.evidence[entry.id] === 1 ? 0 : journey.evidence[entry.id] ? 2 : 1;
  const near = shuffled(current.phrases.filter(entry => !used.has(entry.id)), random)
    .sort((first, second) => priority(first) - priority(second))
    .slice(0, size - 1 - due.length);
  const needsRecallSupport = needsSupport(course, 'recall');
  const nearModes = ['gap', needsRecallSupport ? 'order' : 'spelling', 'spelling'];
  const questions = due.map((entry, index) => practiceQuestion('translation', entry, index, base, target, random));
  for (const [index, entry] of near.entries()) {
    let mode = nearModes[index] ?? 'translation';
    if (mode === 'order' && !canOrder(entry, target)) mode = 'spelling';
    questions.push(practiceQuestion(mode, entry, questions.length, base, target, random));
    used.add(entry.id);
  }
  const stretch = randomItem((next ?? current).phrases.filter(entry => !used.has(entry.id)), random);
  questions.push(practiceQuestion(next ? 'translation' : 'gap', stretch, questions.length, base, target, random));
  return questions;
}

export function placementQuestions(base, target, random = Math.random) {
  return path.slice(0, 4).flatMap(step => step.anchorUnits).map((unit, index) =>
    practiceQuestion('translation', randomItem(unit.phrases, random), index, base, target, random)
  );
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
