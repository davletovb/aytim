// Shared by the browser importer and the Worker. Never trust an uploaded save.
const codes = ['uz', 'en', 'ru', 'ar', 'tr', 'de'];
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
export const maxSaveBytes = 1024 * 1024;

function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid save');
  return value;
}

function number(value, min = 0, max = 1e15) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error('Invalid number');
  return value;
}

function text(value) {
  if (typeof value !== 'string' || value.length > 160 || forbidden.has(value)) throw new Error('Invalid key');
  return value;
}

function dictionary(value, check, limit = 5000) {
  const entries = Object.entries(object(value));
  if (entries.length > limit) throw new Error('Save is too large');
  return Object.fromEntries(entries.map(([key, entry]) => [text(key), check(entry, key)]));
}

function strings(value) {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid list');
  return value.map(text);
}

function course(value) {
  object(value);
  const result = {
    best: dictionary(value.best ?? {}, score => number(score, 0, 10000)),
    cards: dictionary(value.cards ?? {}, card => {
      object(card);
      return { step: number(card.step, -1, 4), due: number(card.due) };
    })
  };
  // Vocabulary exposure/recognition/self-reported recall are distinct.
  // Optional for older saves and bounded by the vocabulary catalog size.
  if (value.vocabProgress !== undefined) result.vocabProgress = dictionary(value.vocabProgress, progress => {
    object(progress);
    const attempts = number(progress.attempts ?? 0, 0, 100000);
    const correct = number(progress.correct ?? 0, 0, attempts);
    const recallAttempts = number(progress.recallAttempts ?? 0, 0, 100000);
    const recallCorrect = number(progress.recallCorrect ?? 0, 0, recallAttempts);
    return {
      introducedAt: number(progress.introducedAt),
      attempts, correct, recallAttempts, recallCorrect,
      lastAttemptAt: number(progress.lastAttemptAt ?? 0)
    };
  }, 1000);
  for (const key of ['practiceBest', 'storyBest']) {
    if (value[key] !== undefined) result[key] = dictionary(value[key], score => number(score, 0, 10000));
  }
  if (value.placement !== undefined) result.placement = number(value.placement, 0, 100);
  if (value.placementDone !== undefined) {
    if (typeof value.placementDone !== 'boolean') throw new Error('Invalid placement status');
    result.placementDone = value.placementDone;
  }
  if (value.skills !== undefined) result.skills = dictionary(value.skills, (entry, skill) => {
    if (!['listening', 'writing', 'speaking'].includes(skill)) throw new Error('Invalid skill');
    object(entry);
    return {
      practice: number(entry.practice ?? 0, 0, 100000),
      tests: dictionary(entry.tests ?? {}, (test, level) => {
        if (!/^[1-8]$/.test(level)) throw new Error('Invalid skill level');
        object(test);
        const attempts = number(test.attempts ?? 0, 0, 100000);
        const best = number(test.best ?? 0, 0, 5);
        const total = number(test.total ?? 0, 0, 5);
        const completed = number(test.completed ?? 0, 0, 5);
        if (best > total || total > completed) throw new Error('Invalid skill results');
        return { attempts, best, total, completed };
      }, 8)
    };
  }, 3);
  if (value.activityDays !== undefined) result.activityDays = dictionary(value.activityDays, (entry, date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid activity date');
    object(entry);
    return {
      seconds: number(entry.seconds), sessions: number(entry.sessions),
      // Older saves have no xp and fall back to a flat rate per activity.
      ...(entry.xp === undefined ? {} : { xp: number(entry.xp) }),
      lessons: strings(entry.lessons), recalled: strings(entry.recalled)
    };
  }, 30000);
  if (value.journey !== undefined) {
    const journey = object(value.journey);
    result.journey = {
      level: number(journey.level, 1, 8),
      evidence: dictionary(journey.evidence, strength => number(strength, 1, 2)),
      recent: dictionary(journey.recent, answers => {
        if (!Array.isArray(answers) || answers.length > 6 || answers.some(answer => typeof answer !== 'boolean')) {
          throw new Error('Invalid practice history');
        }
        return answers;
      }, 30),
      lastActivity: journey.lastActivity === null ? null : text(journey.lastActivity)
    };
  }
  return result;
}

export function validateState(value) {
  object(value);
  if (!codes.includes(value.base) || !codes.includes(value.target) || value.base === value.target) {
    throw new Error('Invalid language pair');
  }
  if (value.transliterate !== undefined && typeof value.transliterate !== 'boolean') throw new Error('Invalid setting');
  if (value.speaker !== undefined && !['m', 'f'].includes(value.speaker)) throw new Error('Invalid setting');
  return {
    base: value.base, target: value.target, transliterate: value.transliterate ?? true,
    // Masculine or feminine speaker forms in Russian, Arabic and German phrases (optional).
    ...(value.speaker ? { speaker: value.speaker } : {}),
    courses: dictionary(value.courses ?? {}, (entry, pair) => {
      const [base, target, extra] = pair.split('>');
      if (extra !== undefined || !codes.includes(base) || !codes.includes(target) || base === target) {
        throw new Error('Invalid course');
      }
      return course(entry);
    }, 30)
  };
}
