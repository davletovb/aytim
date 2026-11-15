import { contentType, failure, json, rawBody, requireSameOrigin } from './http.mjs';

// Speaking checks send a short clip recorded in the page, as 16 kHz mono 16-bit WAV.
// Uzbek goes to Azure (Whisper does not recognize it usefully); the other five
// languages go to Whisper on Workers AI, inside Cloudflare. The audio is never stored.
export const sampleRate = 16000;
export const maxSeconds = 15;
const minSeconds = 0.3;
const bytesPerSecond = sampleRate * 2;
export const maxAudioBytes = 64 + maxSeconds * bytesPerSecond;

export const whisperModel = '@cf/openai/whisper-large-v3-turbo';
export const recognizers = Object.freeze({
  uz: { provider: 'azure', locale: 'uz-UZ' },
  en: { provider: 'workers-ai', language: 'en' },
  ru: { provider: 'workers-ai', language: 'ru' },
  ar: { provider: 'workers-ai', language: 'ar' },
  tr: { provider: 'workers-ai', language: 'tr' },
  de: { provider: 'workers-ai', language: 'de' }
});

// Stay inside the free allowances: Azure F0 includes 5 audio hours a month, and the
// Workers AI daily allocation (10,000 neurons) covers about 214 Whisper turbo minutes.
// Either cap can be changed with a Worker variable, e.g. after moving Azure to S0.
const defaultBudgets = { azure: 16200, 'workers-ai': 12000 };
const budgetVariables = { azure: 'SPEECH_AZURE_SECONDS_PER_MONTH', 'workers-ai': 'SPEECH_WHISPER_SECONDS_PER_DAY' };

export function budgetFor(provider, env, date) {
  const configured = Number(env[budgetVariables[provider]]);
  const seconds = Number.isSafeInteger(configured) && configured >= 0 ? configured : defaultBudgets[provider];
  // Azure bills a month of audio; the Workers AI allocation resets daily at 00:00 UTC.
  const period = provider + ':' + (provider === 'azure' ? date.slice(0, 7) : date.slice(0, 10));
  return { period, seconds };
}

const ascii = (bytes, offset) => String.fromCharCode(...bytes.subarray(offset, offset + 4));

// Accept only the format the page records, and work out its length from the data itself.
export function wavDuration(bytes) {
  if (bytes.byteLength < 44 || ascii(bytes, 0) !== 'RIFF' || ascii(bytes, 8) !== 'WAVE') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let format = null;
  for (let offset = 12; offset + 8 <= bytes.byteLength;) {
    const id = ascii(bytes, offset);
    const size = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (id === 'fmt ' && size >= 16 && start + 16 <= bytes.byteLength) {
      format = {
        encoding: view.getUint16(start, true), channels: view.getUint16(start + 2, true),
        rate: view.getUint32(start + 4, true), bits: view.getUint16(start + 14, true)
      };
    }
    if (id === 'data') {
      if (format?.encoding !== 1 || format.channels !== 1 || format.rate !== sampleRate || format.bits !== 16) return null;
      const length = Math.min(size, bytes.byteLength - start);
      return length / bytesPerSecond;
    }
    offset = start + size + (size % 2);
  }
  return null;
}

export async function reserveSeconds(db, { period, seconds: cap }, seconds) {
  if (!db) return false;
  // Atomic, like the TTS budget: parallel requests cannot overshoot the cap.
  const result = await db.prepare(`INSERT INTO speech_budget (period, seconds) SELECT ?, ? WHERE ? <= ?
    ON CONFLICT(period) DO UPDATE SET seconds = seconds + excluded.seconds
    WHERE seconds + excluded.seconds <= ?
    RETURNING seconds`).bind(period, seconds, seconds, cap, cap).first();
  return Boolean(result);
}

function base64(bytes) {
  let text = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(text);
}

const quietStatuses = new Set(['NoMatch', 'InitialSilenceTimeout', 'BabbleTimeout']);

async function azureTranscript(bytes, locale, env, fetcher) {
  const endpoint = `https://${env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?` +
    new URLSearchParams({ language: locale, format: 'simple', profanity: 'raw' });
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
      'Content-Type': `audio/wav; codecs=audio/pcm; samplerate=${sampleRate}`,
      Accept: 'application/json',
      'User-Agent': 'AytimLanguageLearning'
    },
    body: bytes,
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error('Azure speech recognition failed');
  const result = await response.json();
  if (result?.RecognitionStatus === 'Success') return String(result.DisplayText ?? '');
  if (quietStatuses.has(result?.RecognitionStatus)) return '';
  throw new Error('Azure speech recognition failed');
}

export async function whisperTranscript(bytes, language, env) {
  const result = await env.AI.run(whisperModel, {
    audio: base64(bytes), task: 'transcribe', language,
    // Silence and short clips are where Whisper invents text; trim and do not chain segments.
    vad_filter: true, condition_on_previous_text: false
  });
  if (typeof result?.text !== 'string') throw new Error('Whisper returned no text');
  return result.text.trim().slice(0, 500);
}

const configured = (provider, env) => provider === 'azure'
  ? Boolean(env.AZURE_SPEECH_KEY && /^[a-z0-9]+$/.test(env.AZURE_SPEECH_REGION ?? ''))
  : typeof env.AI?.run === 'function';

// POST /api/speech?lang=<code> with the WAV clip as the body; answers { transcript }.
export async function recognize(request, env, { fetcher = fetch, today = () => new Date().toISOString() } = {}) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
  requireSameOrigin(request);
  const lang = new URL(request.url).searchParams.get('lang');
  if (!Object.hasOwn(recognizers, lang ?? '')) return json({ error: 'Unsupported language' }, 400);
  if (contentType(request) !== 'audio/wav') return json({ error: 'Expected WAV audio' }, 415);
  const { provider, locale, language } = recognizers[lang];
  if (!configured(provider, env)) return json({ error: 'Speech recognition is not configured' }, 503);
  // One learner's retries are fine; a script hammering the endpoint is not.
  if (env.SPEECH_LIMITER) {
    const key = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.SPEECH_LIMITER.limit({ key });
    if (!success) return json({ error: 'Too many speech checks. Wait a moment.', reason: 'rate' }, 429);
  }

  const bytes = await rawBody(request, maxAudioBytes, 'Missing audio');
  const duration = wavDuration(bytes);
  if (duration === null) return json({ error: 'Expected 16 kHz mono 16-bit WAV' }, 415);
  if (duration > maxSeconds) return json({ error: 'Recording is too long' }, 413);
  if (duration < minSeconds) return json({ transcript: '' });
  if (!await reserveSeconds(env.DB, budgetFor(provider, env, today()), Math.ceil(duration))) {
    return json({ error: 'Speech recognition budget reached or database unavailable', reason: 'budget' }, 429);
  }
  let transcript;
  try {
    transcript = provider === 'azure'
      ? await azureTranscript(bytes, locale, env, fetcher)
      : await whisperTranscript(bytes, language, env);
  } catch {
    return json({ error: 'Speech recognition is temporarily unavailable' }, 503);
  }
  return json({ transcript: transcript.trim().slice(0, 500) });
}
