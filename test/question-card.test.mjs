import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { copy } from '../dist/copy.mjs';

const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../dist/app.mjs', import.meta.url), 'utf8');

// Every question type uses one card: header, instruction, prompt panel, answer area, footer.
test('question cards use only the shared type scale', () => {
  const scale = css.match(/:root \{ --q-prompt: (\d+)px; --q-prompt-long: (\d+)px; --q-instruction: (\d+)px; --q-answer: (\d+)px; --q-support: (\d+)px; --q-meta: (\d+)px; \}/);
  assert.ok(scale, 'the unified card defines its type scale');
  assert.deepEqual(scale.slice(1).map(Number), [26, 21, 18, 17, 15, 13]);
  // Fixed sizes allowed outside the scale: 12 px caps labels and the 14 px listen pill / reading aid.
  const allowed = /^(var\(--q-(prompt|prompt-long|instruction|answer|support|meta)\)|12px|14px)$/;
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector]) => /(^|[\s,])\.(q-|option-copy|word-bank-tile|match-card\b)/.test(selector.trim()) && !/@media/.test(selector));
  assert.ok(rules.length > 20);
  for (const [, selector, body] of rules) {
    for (const [, size] of body.matchAll(/font-size:\s*([^;]+);/g)) {
      assert.match(size.trim(), allowed, selector.trim() + ' uses a size outside the scale: ' + size);
    }
  }
});

test('old one-off question layouts are gone', () => {
  for (const name of ['quiz-prompt', 'quiz-phrase', 'session-progress', 'skill-prompt', 'skill-source', 'flashcard-face',
    'lesson-flow-context', 'lesson-flow-audio', 'word-bank-actions', 'match-footer', 'reading-reference', 'skill-record-start']) {
    assert.ok(!app.includes(name), 'app.mjs still renders ' + name);
    assert.ok(!css.includes('.' + name), 'styles.css still styles ' + name);
  }
  for (const part of ['function questionHeader', 'function questionInstruction', 'function promptPanel', 'function questionFooter']) {
    assert.ok(app.includes(part), part);
  }
  // Each screen family builds its card from the shared header.
  for (const screen of ['function renderQuiz', 'function renderSkillSession', 'function renderFlashcard', 'function renderMatch']) {
    const start = app.indexOf(screen);
    const body = app.slice(start, app.indexOf('\nfunction ', start + 10));
    assert.ok(/questionHeader\(|lessonHeader\(/.test(body), screen + ' uses the shared header');
    assert.ok(body.includes('questionFooter('), screen + ' uses the shared footer');
  }
});

test('card text exists in all six interface languages', () => {
  const keys = ['skillReading', 'unscored', 'lessonFlowNewPhrases', 'listenHint', 'bankPlaceholder', 'storyQuestion', 'revealPlaceholder',
    'reviewInstruction', 'matchInstruction', 'pairs', 'cardLabel', 'taskLabel', 'speakHint', 'situation', 'translateWord'];
  assert.equal(Object.keys(copy).length, 6);
  for (const [code, strings] of Object.entries(copy)) for (const key of keys) assert.ok(strings[key]?.trim(), code + ': ' + key);
});
