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

// Russian needs a reading aid too, but unlike Arabic it does not need one
// written by hand: the spelling is alphabetic, so a letter-for-letter
// romanisation can be produced from the text. This follows BGN/PCGN, the
// romanisation used on maps and passports. It shows which letters are there,
// not where the stress falls, so it is a reading aid and not a pronunciation
// guide; Settings can turn it off.
const cyrillic = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k',
  л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '’', э: 'e',
  ю: 'yu', я: 'ya'
};
const vowels = 'аеёиоуыэюя';
// After a vowel, a soft or hard sign, or at the start of a word, е and ё carry
// their glide; after ж, ш, щ and ч, ё is written without it.
const hushing = 'жшщч';

function romanizeLetter(letter, previous) {
  const leading = !previous || !/[\p{L}\p{M}]/u.test(previous);
  const glide = leading || vowels.includes(previous) || previous === 'ь' || previous === 'ъ';
  if (letter === 'е') return glide ? 'ye' : 'e';
  if (letter === 'ё') return hushing.includes(previous) ? 'o' : 'yo';
  return cyrillic[letter] ?? null;
}

export function romanizeRussian(text) {
  let result = '';
  const source = String(text ?? '');
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    const lower = character.toLowerCase();
    const mapped = romanizeLetter(lower, source[index - 1]?.toLowerCase());
    if (mapped === null) { result += character; continue; }
    result += character === lower || !mapped ? mapped : mapped[0].toUpperCase() + mapped.slice(1);
  }
  return result;
}

// The reading aid for one phrase: written by hand for Arabic, produced for Russian.
export function readingAidText(entry, code) {
  if (code === 'ar') return entry?.romanization ?? '';
  if (code === 'ru') return romanizeRussian(entry?.text?.ru ?? '');
  return '';
}

// The aid for a single word. Russian is produced from the text, so it can
// follow the word exactly as a tile shows it, including a lower-cased first
// word; Arabic has to be taken from its phrase by position.
export function wordAid(word, code, phraseAid, index) {
  if (code === 'ru') return romanizeRussian(word);
  return phraseAid?.[index];
}

// The same aid split into words, for a tile or an option that shows only one.
export function readingAid(entry, code) {
  const text = readingAidText(entry, code);
  if (!text || !entry?.text?.[code]) return null;
  const script = aidWords(entry.text[code]);
  const aid = aidWords(text);
  return script.length === aid.length ? aid : null;
}
