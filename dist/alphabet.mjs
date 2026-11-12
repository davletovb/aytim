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

// An example the learner has already met, so the letter is read in a real word.
// A word that starts with it reads most clearly, but three Russian letters never
// begin a word, so any word containing it will do.
export function letterExample(letter, entries, code) {
  const lower = letter.toLowerCase();
  const text = entry => String(entry.text?.[code] ?? '').toLowerCase();
  return entries.find(entry => text(entry).trim().startsWith(lower))
    ?? entries.find(entry => text(entry).includes(lower))
    ?? null;
}
