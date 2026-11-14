import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');

test('six country illustrations retain their landmarks in moonlit variants', () => {
  for (const lang of ['ar', 'de', 'en', 'ru', 'tr', 'uz']) {
    const day = read('journey-' + lang + '.svg');
    const night = read('journey-' + lang + '-night.svg');
    assert.ok(night.includes('id="night-moon"'), lang);
    assert.ok(night.includes('id="night-sky-stars"'), lang);
    assert.ok(night.includes('stop-color="#0b222a"'), lang);
    assert.ok(night.includes('<svg xmlns="http://www.w3.org/2000/svg"'), lang);
    assert.ok(night.split('<path ').length >= day.split('<path ').length, lang);
  }
});

test('home illustrations swap on the browser light-dark preference', () => {
  const app = read('app.mjs');
  assert.ok(app.includes('<picture>'));
  assert.ok(app.includes('media="(prefers-color-scheme: dark)"'));
  assert.ok(app.includes('journey-${state.target}-night.svg'));
  assert.ok(app.includes('journey-${state.target}.svg'));
});
