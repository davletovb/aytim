import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { budgetFor, maxAudioBytes, recognize, recognizers, reserveSeconds, wavDuration, whisperModel }
  from '../src/recognition.mjs';
import { clipFrom, downsample, encodeWav, microphoneOutcome, recognizeClip, trimSilence }
  from '../dist/speech-capture.mjs';
import { languages } from '../dist/content.mjs';
import { workerOptions, migrate } from './worker-helper.mjs';

const origin = 'https://aytim.example';
const tone = (seconds, rate = 16000, level = 0.3) =>
  Float32Array.from({ length: Math.round(seconds * rate) }, (_, index) => level * Math.sin(index / 5));
const wav = seconds => new Uint8Array(encodeWav(tone(seconds)));

function speechRequest(lang, bytes, headers = {}) {
  return new Request(origin + '/api/speech?' + new URLSearchParams({ lang }), {
    method: 'POST', body: bytes,
    headers: { 'X-Aytim-Client': '1', 'Content-Type': 'audio/wav', Origin: origin, ...headers }
  });
}

// A budget table that grants until the cap, like the D1 statement it stands in for.
function budget(cap = Infinity) {
  const used = new Map();
  const calls = [];
  return {
    calls,
    prepare: () => ({ bind: (period, seconds) => ({ first: async () => {
      calls.push([period, seconds]);
      const total = (used.get(period) ?? 0) + seconds;
      if (total > cap) return null;
      used.set(period, total);
      return { seconds: total };
    } }) })
  };
}

const azureEnv = db => ({ AZURE_SPEECH_KEY: 'test-not-real', AZURE_SPEECH_REGION: 'germanywestcentral', DB: db });

test('Uzbek is recognized by Azure and the other five languages by Whisper', () => {
  assert.deepEqual(Object.keys(recognizers).sort(), Object.keys(languages).sort());
  assert.equal(recognizers.uz.provider, 'azure');
  assert.equal(recognizers.uz.locale, 'uz-UZ');
  for (const code of ['en', 'ru', 'ar', 'tr', 'de']) {
    assert.equal(recognizers[code].provider, 'workers-ai', code);
    assert.equal(recognizers[code].language, code);
  }
});

test('the page records 16 kHz mono 16-bit WAV that the Worker measures from its data', () => {
  const bytes = new Uint8Array(encodeWav(Float32Array.from([0, 1, -1, 0.5, 2, -2])));
  const view = new DataView(bytes.buffer);
  assert.equal(String.fromCharCode(...bytes.subarray(0, 4)), 'RIFF');
  assert.equal(view.getUint32(24, true), 16000);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint16(34, true), 16);
  assert.deepEqual([...new Int16Array(bytes.buffer, 44)], [0, 32767, -32768, 16383, 32767, -32768]);
  assert.equal(wavDuration(wav(2)), 2);
  // Other formats, truncated headers and non-WAV bodies are refused.
  const stereo = wav(1); new DataView(stereo.buffer).setUint16(22, 2, true);
  const rate = wav(1); new DataView(rate.buffer).setUint32(24, 44100, true);
  for (const bad of [stereo, rate, wav(1).subarray(0, 30), new TextEncoder().encode('<html>not audio</html>'.padEnd(64))]) {
    assert.equal(wavDuration(bad), null);
  }
});

test('device audio is resampled to 16 kHz and trimmed to the speech in it', () => {
  assert.equal(downsample(new Float32Array(48000).fill(0.5), 48000).length, 16000);
  assert.ok(downsample(new Float32Array(48000).fill(0.5), 48000).every(value => Math.abs(value - 0.5) < 1e-6));
  assert.equal(downsample(new Float32Array(44100), 44100).length, 16000);
  assert.equal(downsample(Float32Array.from([0, 1]), 8000).length, 4);
  // A second of silence, half a second of speech, a second of silence.
  const clip = new Float32Array(40000);
  clip.set(tone(0.5), 16000);
  const speech = trimSilence(clip);
  assert.ok(speech.length >= 8000 && speech.length <= 8000 + 2 * 4800 + 320, String(speech.length));
  assert.equal(trimSilence(new Float32Array(32000)), null);
  assert.equal(trimSilence(new Float32Array(32000).fill(0.001)), null, 'background hiss is silence');
});

test('a recording becomes one clip, cut at the time limit, or nothing when it was silent', () => {
  const chunks = Array.from({ length: 20 }, () => tone(1, 48000));
  const clip = clipFrom(chunks, 48000, 12);
  assert.equal(clip.wav.type, 'audio/wav');
  assert.ok(clip.seconds <= 12 && clip.seconds > 11, String(clip.seconds));
  assert.equal(clipFrom([new Float32Array(48000)], 48000), null);
  assert.equal(clipFrom([], 48000), null);
});

test('microphone failures say whether retrying on this device can help', () => {
  assert.deepEqual(microphoneOutcome({ name: 'NotAllowedError' }), { key: 'lessonSpeechDenied', microphone: true });
  assert.deepEqual(microphoneOutcome({ name: 'NotFoundError' }), { key: 'lessonSpeechMic', microphone: true });
  assert.deepEqual(microphoneOutcome({ name: 'NotReadableError' }), { key: 'lessonSpeechMic' });
  assert.deepEqual(microphoneOutcome(new TypeError('no AudioContext')), { key: 'lessonSpeechMic', microphone: true });
});

test('Uzbek clips go to Azure short-audio recognition and nothing else is called', async () => {
  const db = budget();
  let request;
  const fetcher = async (endpoint, options) => {
    request = { endpoint, options };
    return Response.json({ RecognitionStatus: 'Success', DisplayText: 'Assalomu alaykum. ' });
  };
  const env = { ...azureEnv(db), AI: { run: async () => assert.fail('Whisper must not see Uzbek') } };
  const response = await recognize(speechRequest('uz', wav(1.4)), env, { fetcher, today: () => '2026-11-15T10:00:00Z' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { transcript: 'Assalomu alaykum.' });
  const url = new URL(request.endpoint);
  assert.equal(url.host, 'germanywestcentral.stt.speech.microsoft.com');
  assert.equal(url.searchParams.get('language'), 'uz-UZ');
  assert.equal(request.options.headers['Ocp-Apim-Subscription-Key'], 'test-not-real');
  assert.match(request.options.headers['Content-Type'], /^audio\/wav; codecs=audio\/pcm; samplerate=16000$/);
  assert.equal(request.options.body.byteLength, wav(1.4).byteLength);
  assert.deepEqual(db.calls, [['azure:2026-11', 2]], 'seconds are reserved, rounded up, per month');
});

test('other languages go to Whisper on Workers AI with the language named', async () => {
  for (const lang of ['en', 'ru', 'ar', 'tr', 'de']) {
    const db = budget();
    const runs = [];
    const env = { DB: db, AI: { run: async (model, input) => { runs.push({ model, input }); return { text: ' Guten Morgen ' }; } } };
    const response = await recognize(speechRequest(lang, wav(1)), env, {
      fetcher: async () => assert.fail('Azure must not be called'), today: () => '2026-11-15T23:59:59Z'
    });
    assert.equal(response.status, 200, lang);
    assert.deepEqual(await response.json(), { transcript: 'Guten Morgen' });
    assert.equal(runs.length, 1);
    assert.equal(runs[0].model, whisperModel);
    assert.equal(runs[0].input.language, lang);
    assert.equal(runs[0].input.vad_filter, true);
    assert.deepEqual(Uint8Array.from(atob(runs[0].input.audio), char => char.charCodeAt(0)), wav(1));
    assert.deepEqual(db.calls, [['workers-ai:2026-11-15', 1]], 'Whisper seconds are counted per UTC day');
  }
});

test('a spent budget refuses the clip before any recognizer is called', async () => {
  let called = false;
  const env = { ...azureEnv(budget(10)), AI: { run: async () => { called = true; return { text: 'x' }; } } };
  const fetcher = async () => { called = true; return Response.json({ RecognitionStatus: 'Success', DisplayText: 'x' }); };
  assert.equal((await recognize(speechRequest('uz', wav(8)), env, { fetcher })).status, 200);
  const refused = await recognize(speechRequest('uz', wav(3)), env, { fetcher });
  assert.equal(refused.status, 429);
  assert.equal((await refused.json()).reason, 'budget');
  called = false;
  assert.equal((await recognize(speechRequest('uz', wav(3)), { ...env, DB: undefined }, { fetcher })).status, 429);
  assert.equal(called, false);
  // Caps follow the free tiers unless a Worker variable changes them.
  assert.deepEqual(budgetFor('azure', {}, '2026-11-15T00:00:00Z'), { period: 'azure:2026-11', seconds: 16200 });
  assert.deepEqual(budgetFor('workers-ai', {}, '2026-11-15T00:00:00Z'), { period: 'workers-ai:2026-11-15', seconds: 12000 });
  assert.equal(budgetFor('azure', { SPEECH_AZURE_SECONDS_PER_MONTH: '90000' }, '2026-11-15').seconds, 90000);
  assert.equal(budgetFor('azure', { SPEECH_AZURE_SECONDS_PER_MONTH: 'lots' }, '2026-11-15').seconds, 16200);
});

test('silence and recognizer failures are told apart', async () => {
  const quiet = await recognize(speechRequest('uz', wav(1)), azureEnv(budget()), {
    fetcher: async () => Response.json({ RecognitionStatus: 'InitialSilenceTimeout' })
  });
  assert.deepEqual(await quiet.json(), { transcript: '' });
  for (const fetcher of [async () => new Response('denied', { status: 401 }), async () => { throw new Error('offline'); },
    async () => Response.json({ RecognitionStatus: 'Error' })]) {
    assert.equal((await recognize(speechRequest('uz', wav(1)), azureEnv(budget()), { fetcher })).status, 503);
  }
  const broken = { DB: budget(), AI: { run: async () => { throw new Error('4006: daily allocation used up'); } } };
  assert.equal((await recognize(speechRequest('en', wav(1)), broken)).status, 503);
  // A clip too short to hold a word costs nothing.
  const env = { DB: budget(), AI: { run: async () => assert.fail('no call for a blip') } };
  assert.deepEqual(await (await recognize(speechRequest('en', wav(0.1)), env)).json(), { transcript: '' });
  assert.deepEqual(env.DB.calls, []);
});

test('the endpoint accepts only same-origin WAV clips of a supported language and length', async () => {
  const env = { DB: budget(), AI: { run: async () => ({ text: 'hello' }) } };
  assert.equal((await recognize(new Request(origin + '/api/speech?lang=en'), env)).status, 405);
  assert.equal((await recognize(speechRequest('xx', wav(1)), env)).status, 400);
  assert.equal((await recognize(speechRequest('constructor', wav(1)), env)).status, 400);
  assert.equal((await recognize(speechRequest('en', wav(1), { 'Content-Type': 'audio/webm' }), env)).status, 415);
  assert.equal((await recognize(speechRequest('en', new Uint8Array(200)), env)).status, 415);
  await assert.rejects(recognize(speechRequest('en', wav(16)), env), { status: 413 });
  assert.ok(wav(15).byteLength <= maxAudioBytes);
  await assert.rejects(recognize(speechRequest('en', wav(1), { Origin: 'https://elsewhere.example' }), env), { status: 403 });
  await assert.rejects(recognize(speechRequest('en', wav(1), { 'X-Aytim-Client': '' }), env), { status: 403 });
  // Not configured: no key for Azure, no AI binding for Whisper.
  assert.equal((await recognize(speechRequest('uz', wav(1)), { DB: budget() })).status, 503);
  assert.equal((await recognize(speechRequest('en', wav(1)), { DB: budget() })).status, 503);
});

test('one address cannot run the endpoint without limit', async () => {
  const keys = [];
  const env = {
    DB: budget(), AI: { run: async () => ({ text: 'hello' }) },
    SPEECH_LIMITER: { limit: async ({ key }) => { keys.push(key); return { success: keys.length <= 1 }; } }
  };
  const ip = { 'CF-Connecting-IP': '203.0.113.7' };
  assert.equal((await recognize(speechRequest('en', wav(1), ip), env)).status, 200);
  const limited = await recognize(speechRequest('en', wav(1), ip), env);
  assert.equal(limited.status, 429);
  assert.equal((await limited.json()).reason, 'rate');
  assert.deepEqual(keys, ['203.0.113.7', '203.0.113.7']);
  assert.equal(env.DB.calls.length, 1, 'a limited request reserves nothing');
});

test('the page reads the Worker’s answers into messages and fallbacks', async () => {
  const answer = (status, body) => async (url, options) => {
    assert.equal(url, '/api/speech?lang=tr');
    assert.equal(options.headers['X-Aytim-Client'], '1');
    return typeof body === 'string' ? new Response(body, { status }) : Response.json(body, { status });
  };
  const clip = new Blob([encodeWav(tone(1))], { type: 'audio/wav' });
  assert.deepEqual(await recognizeClip(clip, 'tr', answer(200, { transcript: ' Günaydın ' })), { transcript: 'Günaydın' });
  assert.deepEqual(await recognizeClip(clip, 'tr', answer(200, { transcript: '' })), { key: 'lessonSpeechNoSpeech' });
  assert.deepEqual(await recognizeClip(clip, 'tr', answer(429, { reason: 'rate' })), { key: 'lessonSpeechBusy' });
  assert.deepEqual(await recognizeClip(clip, 'tr', answer(413, { error: 'long' })), { key: 'lessonSpeechError' });
  // Over budget, not configured, or a static host without the Worker: fall back for the session.
  for (const [status, body] of [[429, { reason: 'budget' }], [503, { error: 'x' }], [404, 'Not found'], [501, '<html>']]) {
    assert.deepEqual(await recognizeClip(clip, 'tr', answer(status, body)), { key: 'lessonSpeechServer', server: true }, String(status));
  }
  assert.deepEqual(await recognizeClip(clip, 'tr', async () => { throw new TypeError('offline'); }), { key: 'lessonSpeechNetwork' });
});

let mf;
before(async () => {
  mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  await migrate(mf);
});
after(async () => { await mf?.dispose(); });

test('the D1 budget never lets parallel clips past the cap', async () => {
  const db = await mf.getD1Database('DB');
  const cap = { period: 'workers-ai:2026-11-15', seconds: 10 };
  const results = await Promise.all(Array.from({ length: 8 }, () => reserveSeconds(db, cap, 3)));
  assert.equal(results.filter(Boolean).length, 3);
  assert.equal((await db.prepare('SELECT seconds FROM speech_budget WHERE period = ?').bind(cap.period).first()).seconds, 9);
  assert.equal(await reserveSeconds(db, { period: 'azure:2026-11', seconds: 5 }, 6), false, 'a first clip over the cap is refused too');
  assert.equal(await db.prepare('SELECT 1 FROM speech_budget WHERE period = ?').bind('azure:2026-11').first(), null);
});

test('the deployed Worker routes /api/speech and reports missing recognizers', async () => {
  const send = (lang, extra = {}) => mf.dispatchFetch('http://localhost/api/speech?lang=' + lang, {
    method: 'POST', body: wav(1), headers: { 'X-Aytim-Client': '1', 'Content-Type': 'audio/wav', ...extra }
  });
  assert.equal((await send('uz')).status, 503);
  assert.equal((await send('en')).status, 503);
  assert.equal((await send('en', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
});
