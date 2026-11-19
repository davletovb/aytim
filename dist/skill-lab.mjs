import { path, accessibleLevel, workingLevel } from './journey.mjs';
import { shuffled } from './engine.mjs';
import { makeWordBank, writingPhrases } from './word-bank.mjs';

// Skill practice is diagnostic, not a substitute for the eight level checkpoints.
// None of these results can directly unlock a level.
export const skillModes = Object.freeze({
  listening: { icon: 'volume', tone: 'peach' },
  writing: { icon: 'pen', tone: 'lilac' },
  speaking: { icon: 'mic', tone: 'mint' }
});
export const skillRoundSize = 5;
const skillNames = Object.keys(skillModes);

export function createSkillRound(skill, course, base, target, assessment = false, random = Math.random) {
  if (!skillNames.includes(skill) || base === target) throw new RangeError('Invalid skill or language pair');
  const unlocked = accessibleLevel(course);
  const level = assessment ? unlocked : workingLevel(course, skill === 'listening' ? 'listening' : 'recall');
  const step = path[level - 1];
  if (!step) throw new RangeError('Invalid skill level');
  // Five different lesson contexts in each round. All content is already level-tagged.
  const tasks = shuffled(step.units, random).slice(0, skillRoundSize).map((unit, index) => {
    // Word-order activities need at least two tiles. Use meaningful
    // multiword phrases for both writing and listening, including the
    // diagnostic skill practice outside the lesson flow.
    const multiword = writingPhrases(unit.phrases, target);
    const candidates = multiword.length ? multiword : unit.phrases;
    const entry = skill === 'writing'
      ? candidates[0]
      : shuffled(skill === 'listening' ? candidates : unit.phrases, random)[0];
    return {
      entry,
      unitId: unit.id,
      context: unit.description,
      wordBank: skill === 'writing' || skill === 'listening' ? makeWordBank(entry, target, random, unit.phrases) : undefined,
      openEnded: skill === 'speaking' && level >= 4 && index % 2 === 1,
      level
    };
  });
  return { skill, level, assessment, tasks };
}

const numberWords = {
  en: { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', fifteen: '15', twenty: '20', thirty: '30' },
  uz: { nol: '0', bir: '1', ikki: '2', uch: '3', tort: '4', besh: '5', olti: '6', yetti: '7', sakkiz: '8', toqqiz: '9', on: '10', yigirma: '20', ottiz: '30' },
  ru: { ноль: '0', один: '1', одна: '1', одно: '1', два: '2', две: '2', три: '3', четыре: '4', пять: '5', шесть: '6', семь: '7', восемь: '8', девять: '9', десять: '10', одиннадцать: '11', двенадцать: '12', пятнадцать: '15', двадцать: '20', тридцать: '30' },
  ar: { صفر: '0', واحد: '1', واحده: '1', اثنان: '2', اثنين: '2', ثلاثه: '3', ثلاث: '3', اربعه: '4', اربع: '4', خمسه: '5', خمس: '5', سته: '6', ست: '6', سبعه: '7', سبع: '7', ثمانيه: '8', ثماني: '8', تسعه: '9', تسع: '9', عشره: '10', عشر: '10', عشرون: '20', عشرين: '20', ثلاثون: '30', ثلاثين: '30' },
  tr: { sıfır: '0', bir: '1', iki: '2', üç: '3', dört: '4', beş: '5', altı: '6', yedi: '7', sekiz: '8', dokuz: '9', on: '10', yirmi: '20', otuz: '30' },
  de: { null: '0', eins: '1', zwei: '2', drei: '3', vier: '4', fünf: '5', sechs: '6', sieben: '7', acht: '8', neun: '9', zehn: '10', elf: '11', zwölf: '12', fünfzehn: '15', zwanzig: '20', dreißig: '30' }
};

// Comparison to a *reference sentence*, not an automated judgment of open-ended
// writing. Normalizes common speech-to-text orthography variants (Arabic vowel
// marks/hamza forms, Russian ё/е, Uzbek apostrophes, and cardinal numerals).
export function matchesReference(attempt, reference, target) {
  const digits = numberWords[target];
  const normalize = value => {
    let text = String(value).normalize('NFC').toLocaleLowerCase(target);
    if (target === 'ru') text = text.replace(/ё/g, 'е');
    if (target === 'ar') {
      text = text.replace(/[\u0640\u064B-\u065F\u0670]/g, '')
        .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
        .replace(/[\u0660-\u0669]/g, char => String(char.charCodeAt(0) - 0x0660));
    }
    if (target === 'uz') text = text.replace(/[\u02BB\u02BC\u02B9\u2018\u2019'`]/g, '');
    text = text.replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (digits && text) text = text.split(' ').map(word => digits[word] ?? word).join(' ');
    return text;
  };
  return Boolean(String(attempt).trim()) && normalize(attempt) === normalize(reference);
}

export function recordSkillRound(course, round, outcomes) {
  if (!skillNames.includes(round.skill) || !Number.isInteger(round.level) ||
      round.level < 1 || round.level > accessibleLevel(course) ||
      !Array.isArray(outcomes) || outcomes.length !== round.tasks.length) {
    throw new RangeError('Invalid skill result');
  }
  const valid = outcomes.filter(item => item && item.attempted === true);
  const matched = valid.filter(item => item.referenceMatch === true && item.scorable === true).length;
  const scored = valid.filter(item => item.scorable === true).length;
  course.skills ??= {};
  const progress = course.skills[round.skill] ??= { practice: 0, tests: {} };
  if (round.assessment) {
    const key = String(round.level);
    const previous = progress.tests[key] ?? { attempts: 0, best: 0, total: 0, completed: 0 };
    progress.tests[key] = {
      attempts: previous.attempts + 1,
      best: Math.max(previous.best, matched),
      total: Math.max(previous.total, scored),
      completed: Math.max(previous.completed, valid.length)
    };
  } else {
    progress.practice += 1;
    // Unscored/revealed tasks and speaking participation are never accuracy grades.
    // The regular practice card displays a comparable best only for fully scored rounds.
    if (round.skill !== 'speaking' && scored === round.tasks.length) {
      course.practiceBest ??= {};
      const key = 'skill-' + round.skill;
      course.practiceBest[key] = Math.max(course.practiceBest[key] ?? 0, matched);
    }
  }
  return { completed: valid.length, matched, scored, total: round.tasks.length };
}

export function skillSnapshot(course, skill, level) {
  if (!skillNames.includes(skill)) throw new RangeError('Invalid skill');
  const progress = course.skills?.[skill];
  const test = progress?.tests?.[String(level)];
  return {
    practice: progress?.practice ?? 0,
    practiceBest: course.practiceBest?.['skill-' + skill],
    attempts: test?.attempts ?? 0,
    // For writing this is a reference match, for listening an audio-only
    // transcript match. Speaking records participation only.
    best: test?.best ?? 0,
    scored: test?.total ?? 0,
    completed: test?.completed ?? 0
  };
}
