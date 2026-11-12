// Aytim stores one reading aid per phrase, but a word tile or an answer option
// shows a single word. The aid is split the same way the tiles are and matched
// by position: every catalog entry has as many romanised words as script words,
// and an entry that ever stopped matching simply shows no aid rather than
// guessing which word is which.
const edgePunctuation = /^[¿¡«»"“”„(]+|[.!?؟。！？,،;:…»"“”)]+$/gu;
const hasLetter = /[\p{L}\p{N}]/u;

export function aidWords(text) {
  return String(text ?? '').trim().split(/\s+/u)
    .filter(part => hasLetter.test(part))
    .map(part => part.replace(edgePunctuation, '') || part);
}

// Only Arabic carries a stored reading aid; the other scripts need none.
export function readingAid(entry, code) {
  if (code !== 'ar' || !entry?.romanization || !entry.text?.[code]) return null;
  const script = aidWords(entry.text[code]);
  const aid = aidWords(entry.romanization);
  return script.length === aid.length ? aid : null;
}
