import { path, accessibleLevel, workingLevel } from './journey.mjs';
import { shuffled } from './engine.mjs';
import { makeWordBank } from './word-bank.mjs';

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
    // Writing uses word-bank sentence building at every level for now. Prefer
    // the longer expressions so advanced lessons remain more demanding.
    const entry = skill === 'writing'
      ? [...unit.phrases].sort((a, b) =>
          b.text[target].trim().split(/\s+/u).length - a.text[target].trim().split(/\s+/u).length)[0]
      : shuffled(unit.phrases, random)[0];
    return {
      entry,
      unitId: unit.id,
      context: unit.description,
      wordBank: skill === 'writing' || skill === 'listening' ? makeWordBank(entry, target, random) : undefined,
      openEnded: skill === 'speaking' && level >= 4 && index % 2 === 1,
      level
    };
  });
  return { skill, level, assessment, tasks };
}

// Comparison to a *reference sentence*, not an automated judgment of open-ended
// writing. Diacritics are meaningful in most target languages, but short vowel
// marks and tatweel in Arabic are ignored for the reference comparison.
export function matchesReference(attempt, reference, target) {
  const normalize = value => {
    let text = String(value).normalize('NFC').toLocaleLowerCase(target)
      .replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (target === 'ar') text = text.replace(/[\u0640\u064B-\u065F\u0670]/g, '');
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
  }
  return { completed: valid.length, matched, scored, total: round.tasks.length };
}

export function skillSnapshot(course, skill, level) {
  if (!skillNames.includes(skill)) throw new RangeError('Invalid skill');
  const progress = course.skills?.[skill];
  const test = progress?.tests?.[String(level)];
  return {
    practice: progress?.practice ?? 0,
    attempts: test?.attempts ?? 0,
    // For writing this is a reference match, for listening an audio-only
    // transcript match. Speaking records participation only.
    best: test?.best ?? 0,
    scored: test?.total ?? 0,
    completed: test?.completed ?? 0
  };
}
