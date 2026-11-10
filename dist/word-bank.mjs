import { shuffled } from './engine.mjs';

// Every word tile is a separate object with a stable position ID. This allows
// learners to remove any tile, including repeated words, without ambiguity.
// Short terminal sentence punctuation remains in the reference but is not
// printed on the last tile (e.g. "Ali." is displayed as "Ali").
export function makeWordBank(entry, target, random = Math.random) {
  const sentence = entry?.text?.[target];
  if (typeof sentence !== 'string' || !sentence.trim()) throw new RangeError('Missing word bank source');
  const parts = sentence.trim().split(/\s+/u);
  const tiles = parts.map((text, index) => ({
    id: String(index),
    text: text.replace(/[.!?؟。！？]+$/u, '') || text
  }));
  const scrambled = shuffled(tiles, random);
  if (scrambled.length > 1 && scrambled.every((token, index) => token.id === tiles[index].id)) {
    scrambled.push(scrambled.shift());
  }
  return { expected: tiles, tray: scrambled };
}

export function wordBankMatches(bank, ids) {
  if (!bank || !Array.isArray(ids) || ids.length !== bank.expected.length) return false;
  const expectedText = bank.expected.map(tile => tile.text);
  const byId = new Map(bank.expected.map(tile => [tile.id, tile]));
  if (new Set(ids).size !== ids.length || ids.some(id => !byId.has(id))) return false;
  return ids.map(id => byId.get(id).text).every((text, index) => text === expectedText[index]);
}

export function wordBankSelection(bank, ids) {
  const byId = new Map(bank.expected.map(tile => [tile.id, tile]));
  return ids.map(id => byId.get(id)).filter(Boolean);
}
