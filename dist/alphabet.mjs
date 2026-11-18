// A first look at the two scripts Aytim teaches that a learner may not read
// yet. Every part of a letter card is either the letter itself, its reading
// aid, or an example taken from the course vocabulary, so the primer carries
// no prose and needs no translation.
const connects = letter => !'ادذرزو'.includes(letter);
const tatweel = 'ـ';

// Isolated, then the shapes the letter takes once it is joined up. The six
// letters that never join to the one after them have no initial or medial form.
export function letterForms(letter) {
  return connects(letter)
    ? [letter, letter + tatweel, tatweel + letter + tatweel, tatweel + letter]
    : [letter, tatweel + letter];
}

const arabic = [
  ['ا', 'alif', 'ā'], ['ب', 'bāʾ', 'b'], ['ت', 'tāʾ', 't'], ['ث', 'thāʾ', 'th'],
  ['ج', 'jīm', 'j'], ['ح', 'ḥāʾ', 'ḥ'], ['خ', 'khāʾ', 'kh'], ['د', 'dāl', 'd'],
  ['ذ', 'dhāl', 'dh'], ['ر', 'rāʾ', 'r'], ['ز', 'zāy', 'z'], ['س', 'sīn', 's'],
  ['ش', 'shīn', 'sh'], ['ص', 'ṣād', 'ṣ'], ['ض', 'ḍād', 'ḍ'], ['ط', 'ṭāʾ', 'ṭ'],
  ['ظ', 'ẓāʾ', 'ẓ'], ['ع', 'ʿayn', 'ʿ'], ['غ', 'ghayn', 'gh'], ['ف', 'fāʾ', 'f'],
  ['ق', 'qāf', 'q'], ['ك', 'kāf', 'k'], ['ل', 'lām', 'l'], ['م', 'mīm', 'm'],
  ['ن', 'nūn', 'n'], ['ه', 'hāʾ', 'h'], ['و', 'wāw', 'w, ū'], ['ي', 'yāʾ', 'y, ī']
];

// Russian letter names are the sounds themselves, so the reading aid is the name.
const russian = [
  ['А', 'a'], ['Б', 'b'], ['В', 'v'], ['Г', 'g'], ['Д', 'd'], ['Е', 'ye'], ['Ё', 'yo'],
  ['Ж', 'zh'], ['З', 'z'], ['И', 'i'], ['Й', 'y'], ['К', 'k'], ['Л', 'l'], ['М', 'm'],
  ['Н', 'n'], ['О', 'o'], ['П', 'p'], ['Р', 'r'], ['С', 's'], ['Т', 't'], ['У', 'u'],
  ['Ф', 'f'], ['Х', 'kh'], ['Ц', 'ts'], ['Ч', 'ch'], ['Ш', 'sh'], ['Щ', 'shch'],
  ['Ъ', '”'], ['Ы', 'y'], ['Ь', '’'], ['Э', 'e'], ['Ю', 'yu'], ['Я', 'ya']
];

export const alphabets = {
  ar: arabic.map(([letter, name, roman]) => ({ letter, name, roman, forms: letterForms(letter) })),
  ru: russian.map(([letter, roman]) => ({ letter, roman, forms: [letter, letter.toLowerCase()] }))
};

function examplePosition(letter, entry, code) {
  const lower = letter.toLowerCase();
  const text = String(entry.text?.[code] ?? '').toLowerCase();
  if (code !== 'ar') {
    const index = text.indexOf(lower);
    return index < 0 ? null : { index, rank: text.trimStart().startsWith(lower) ? 0 : 2 };
  }
  const roman = entry.romanization?.trim().split(/\s+/u) ?? [];
  let best = null;
  for (const [wordIndex, word] of [...text.matchAll(/[\p{Script=Arabic}\p{M}]+/gu)].entries()) {
    const letters = [...word[0].matchAll(/\p{L}/gu)];
    const stem = letters[0]?.[0] === 'ا' && letters[1]?.[0] === 'ل' ? 2 : 0;
    for (let i = stem; i < letters.length; i++) {
      if (letters[i][0] !== lower) continue;
      const index = word.index + letters[i].index;
      if (lower === 'ا' && (i === 0 || !roman[wordIndex]?.includes('ā') ||
          (i === letters.length - 1 && /[ًو]/u.test(text[index - 1])))) continue;
      const rank = i === stem ? 0 : i < letters.length - 1 ? 1 : 2;
      if (!best || rank < best.rank) best = { index, rank };
    }
  }
  return best;
}

// Prefer a lexical initial letter, then a medial one. An alif example must
// illustrate long ā, so the article and initial hamzat al-waṣl don't count.
export function letterExample(letter, entries, code) {
  let best = null;
  for (const entry of entries) {
    const position = examplePosition(letter, entry, code);
    if (!position) continue;
    if (position.rank === 0) return entry;
    if (!best || position.rank < best.rank) best = { entry, rank: position.rank };
  }
  return best?.entry ?? null;
}

export function letterExampleIndex(letter, entry, code) {
  return examplePosition(letter, entry, code)?.index ?? -1;
}
