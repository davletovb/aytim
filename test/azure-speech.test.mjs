import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAudio, speechMarkup, voicePairs, escapeXml, audio } from '../src/speech.mjs';

const url = (id, lang, gender) =>
  'https://aytim.example/api/audio?' + new URLSearchParams({ id, lang, gender });

test('all six languages have distinct male and female Azure neural voices', () => {
  assert.deepEqual(Object.keys(voicePairs).sort(), ['ar', 'de', 'en', 'ru', 'tr', 'uz']);
  for (const pair of Object.values(voicePairs)) {
    assert.match(pair.m, /Neural$/);
    assert.match(pair.f, /Neural$/);
    assert.notEqual(pair.m, pair.f);
    assert.ok(pair.m.startsWith(pair.locale + '-'));
    assert.ok(pair.f.startsWith(pair.locale + '-'));
  }
});

test('audio resolves published phrases and gendered forms without modifying the catalog', () => {
  const base = resolveAudio('introductions-5', 'ar', 'm');
  const female = resolveAudio('introductions-5', 'ar', 'f');
  assert.notEqual(base.text, female.text);
  assert.match(female.text, /طالبة/);
  assert.match(resolveAudio('introductions-5', 'ru', 'f').text, /студентка/);
  assert.equal(resolveAudio('introductions-5', 'ar', 'm').text, base.text);
  for (const bad of [
    ['no-such-phrase', 'uz', 'm'],
    ['introductions-5', 'not-a-language', 'm'],
    ['introductions-5', 'uz', 'other']
  ]) assert.throws(() => resolveAudio(...bad), { status: 404 });
});

test('SSML safely escapes user-visible curriculum characters', () => {
  assert.equal(escapeXml('A & B < C "D"'), 'A &amp; B &lt; C &quot;D&quot;');
  const xml = speechMarkup({ text: 'A & B < C', locale: 'en-US', voice: voicePairs.en.f });
  assert.match(xml, /A &amp; B &lt; C/);
  assert.match(xml, /name="en-US-JennyNeural"/);
});

test('Azure audio endpoint caches generated audio and does not call Azure on cache hit', async () => {
  const storage = new Map();
  const budget = [];
  const puts = [];
  let azureCalls = 0;
  const env = {
    AZURE_SPEECH_KEY: 'test-not-real',
    AZURE_SPEECH_REGION: 'germanywestcentral',
    DB: { prepare(query) { return { bind(...args) { budget.push(args); return { first: async () => ({ characters: 20 }) }; } }; } }
  };
  const cache = {
    match: async key => storage.get(key.url)?.clone(),
    put: async (key, response) => { storage.set(key.url, response.clone()); puts.push(key.url); }
  };
  const fetcher = async (endpoint, options) => {
    azureCalls++;
    assert.equal(endpoint, 'https://germanywestcentral.tts.speech.microsoft.com/cognitiveservices/v1');
    assert.equal(options.headers['Ocp-Apim-Subscription-Key'], 'test-not-real');
    assert.match(options.body, /<speak /);
    return new Response(new Uint8Array([0x49, 0x44, 0x33, 0x01]), {
      headers: { 'Content-Type': 'audio/mpeg' }
    });
  };
  const pending = [];
  const ctx = { waitUntil: p => pending.push(p) };
  const request = new Request(url('introductions-5', 'uz', 'm'));
  const first = await audio(request, env, ctx, { fetcher, cache });
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('Content-Type'), 'audio/mpeg');
  await Promise.all(pending);
  const second = await audio(request, env, ctx, { fetcher, cache });
  assert.equal(second.status, 200);
  assert.equal(azureCalls, 1);
  assert.equal(budget.length, 1);
  assert.equal(puts.length, 1);
});

test('unconfigured speech and unavailable budget fail without sending an Azure request', async () => {
  const request = new Request(url('introductions-5', 'en', 'm'));
  const noSecrets = await audio(request, {}, {}, { cache: null });
  assert.equal(noSecrets.status, 503);
  let fetched = false;
  const blocked = await audio(request, {
    AZURE_SPEECH_KEY: 'dummy',
    AZURE_SPEECH_REGION: 'germanywestcentral',
    DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) }
  }, {}, { cache: null, fetcher: async () => { fetched = true; } });
  assert.equal(blocked.status, 429);
  assert.equal(fetched, false);
});

test('cross-site audio requests cannot use the Azure proxy', async () => {
  const crossSite = new Request(url('introductions-5', 'en', 'm'), {
    headers: { 'Sec-Fetch-Site': 'cross-site' }
  });
  assert.equal((await audio(crossSite, {}, {}, { cache: null })).status, 403);
});
