import { shuffled } from './engine.mjs';
import { phrases } from './content.mjs';
import { alternativeOrders } from './word-orders.mjs';

// Every word tile is a separate object with a stable position ID. This allows
// learners to remove any tile, including repeated words, without ambiguity.
// Tiles never reveal the sentence structure: punctuation (including commas)
// is not printed on tiles, and the first word is shown in lower case unless it
// is always capitalised (names, German nouns, formal "Sie", English "I").
// A few extra words from the same lesson are mixed in, so the learner has to
// choose words as well as order them.
export const extraTileCount = 2;

const edgePunctuation = /^[¿¡«»"“”„(]+|[.!?؟。！？,،;:…»"“”)]+$/gu;
const hasLetter = /[\p{L}\p{N}]/u;

// Words with an `initial` flag when they start a sentence (a phrase can hold two sentences).
function sourceWords(sentence) {
  const words = [];
  let initial = true;
  for (const part of sentence.trim().split(/\s+/u)) {
    if (!hasLetter.test(part)) continue;
    words.push({ text: part.replace(edgePunctuation, '') || part, initial });
    initial = /[.!?؟。！？]["”»)]*$/u.test(part);
  }
  return words;
}

// German nouns that only ever open a lesson sentence, and a sentence-initial
// verb that is spelled like a noun used elsewhere ("Treffen wir uns …").
const germanInitialNouns = new Set(['Entschuldigung', 'Mittwoch']);
const germanInitialVerbs = new Set(['Treffen']);
let capitalised;
// Words written with a capital letter in the middle of a sentence: per language
// (German nouns, formal "Sie", English weekdays) plus names shared by several languages.
function keepsCapital(word, language) {
  if (language === 'en' && /^I(?:[’']\p{L}+)?$/u.test(word)) return true;
  if (language === 'de' && germanInitialVerbs.has(word)) return false;
  if (language === 'de' && germanInitialNouns.has(word)) return true;
  if (!capitalised) {
    capitalised = {};
    const languagesByWord = new Map();
    for (const entry of phrases) for (const [code, text] of Object.entries(entry.text)) {
      for (const token of sourceWords(text)) {
        if (token.initial || !/^\p{Lu}/u.test(token.text)) continue;
        (capitalised[code] ??= new Set()).add(token.text);
        languagesByWord.set(token.text, (languagesByWord.get(token.text) ?? new Set()).add(code));
      }
    }
    capitalised.names = new Set([...languagesByWord].filter(([, codes]) => codes.size > 1).map(([name]) => name));
  }
  return Boolean(capitalised[language]?.has(word) || capitalised.names.has(word));
}

export function tileWords(sentence, language) {
  return sourceWords(sentence).map(({ text, initial }) => initial && !keepsCapital(text, language)
    ? text.charAt(0).toLocaleLowerCase(language) + text.slice(1)
    : text);
}

const fold = (word, language) => word.toLocaleLowerCase(language);

function sameWords(first, second, language) {
  const sorted = list => list.map(word => fold(word, language)).sort().join('\u0000');
  return first.length === second.length && sorted(first) === sorted(second);
}

// Multiword phrases, longest first (ties keep lesson order). A lesson's writing
// task uses the first; its accepted word orders are listed in word-orders.mjs.
export function writingPhrases(entries, target) {
  const count = entry => entry.text[target].trim().split(/\s+/u).length;
  return entries.filter(entry => count(entry) > 1).sort((a, b) => count(b) - count(a));
}

export function makeWordBank(entry, target, random = Math.random, related = []) {
  const sentence = entry?.text?.[target];
  if (typeof sentence !== 'string' || !sentence.trim()) throw new RangeError('Missing word bank source');
  const words = tileWords(sentence, target);
  const tiles = words.map((text, index) => ({ id: String(index), text }));
  // Extra words come from other phrases of the same lesson and never repeat a needed word.
  const used = new Set(words.map(word => fold(word, target)));
  const extras = [];
  for (const other of shuffled(related.filter(item => item !== entry && item?.text?.[target]), random)) {
    if (extras.length === extraTileCount) break;
    const candidate = shuffled(tileWords(other.text[target], target), random)
      .find(word => word.length > 1 && !used.has(fold(word, target)));
    if (!candidate) continue;
    used.add(fold(candidate, target));
    extras.push({ id: 'x' + extras.length, text: candidate });
  }
  const scrambled = shuffled([...tiles, ...extras], random);
  if (scrambled.length > 1 && scrambled.every((token, index) => token.id === (tiles[index]?.id ?? token.id))) {
    scrambled.push(scrambled.shift());
  }
  const alternatives = (alternativeOrders[entry.id]?.[target] ?? [])
    .map(order => tileWords(order, target))
    .filter(order => sameWords(order, words, target));
  return { expected: tiles, tray: scrambled, alternatives };
}

export function wordBankMatches(bank, ids) {
  if (!bank || !Array.isArray(ids) || !ids.length) return false;
  const byId = new Map((bank.tray ?? bank.expected).map(tile => [tile.id, tile]));
  if (new Set(ids).size !== ids.length || ids.some(id => !byId.has(id))) return false;
  const answer = ids.map(id => byId.get(id).text);
  const accepted = [bank.expected.map(tile => tile.text), ...(bank.alternatives ?? [])];
  return accepted.some(order => order.length === answer.length && order.every((text, index) => text === answer[index]));
}

export function wordBankSelection(bank, ids) {
  const byId = new Map((bank.tray ?? bank.expected).map(tile => [tile.id, tile]));
  return ids.map(id => byId.get(id)).filter(Boolean);
}
