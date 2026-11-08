// Catalog factories have no application imports, so content modules stay acyclic.
export function text(uz, en, ru, ar, tr, de) {
  return { uz, en, ru, ar, tr, de };
}

export function phrase(uz, en, ru, ar, tr, de, romanization) {
  return { text: text(uz, en, ru, ar, tr, de), romanization };
}

export function lesson(id, level, title, description, phrases) {
  return { id, level, icon: 'chat', tone: ['mint', 'sky', 'peach', 'lilac', 'sand', 'rose', 'sky', 'lilac'][level - 1], title, description, phrases };
}

export function vocabulary(id, level, title, words) {
  words.forEach((entry, index) => { entry.id = 'word-' + id + '-' + (index + 1); });
  return { id, level, title, tone: level % 2 ? 'mint' : 'lilac', words };
}

export function question(prompt, correct, firstDistractor, secondDistractor) {
  return { prompt, choices: [correct, firstDistractor, secondDistractor] };
}

export function reading(id, level, title, description, lines, questions) {
  lines.forEach((entry, index) => { entry.id = 'story-' + id + '-' + (index + 1); });
  return { id, level, title, description, tone: level % 2 ? 'sky' : 'peach', lines, questions };
}
