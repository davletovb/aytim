import { languages, phrases } from '../dist/content.mjs';
import { words } from '../dist/words.mjs';
import { storyLines } from '../dist/stories.mjs';
import { dialogueReviewEntries } from '../dist/engine.mjs';
import { feminineForms } from '../dist/speaker-forms.mjs';
import { hash, failure, json } from './http.mjs';

// Standard (not HD/custom) Azure neural voices. Both genders are available for each locale.
export const voicePairs = Object.freeze({
  uz: { locale: 'uz-UZ', f: 'uz-UZ-MadinaNeural', m: 'uz-UZ-SardorNeural' },
  en: { locale: 'en-US', f: 'en-US-JennyNeural', m: 'en-US-GuyNeural' },
  ru: { locale: 'ru-RU', f: 'ru-RU-SvetlanaNeural', m: 'ru-RU-DmitryNeural' },
  ar: { locale: 'ar-SA', f: 'ar-SA-ZariyahNeural', m: 'ar-SA-HamedNeural' },
  tr: { locale: 'tr-TR', f: 'tr-TR-EmelNeural', m: 'tr-TR-AhmetNeural' },
  de: { locale: 'de-DE', f: 'de-DE-KatjaNeural', m: 'de-DE-ConradNeural' }
});

const entries = new Map([...phrases, ...words, ...dialogueReviewEntries, ...storyLines]
  .map(entry => [entry.id, entry]));
const format = 'audio-24khz-48kbitrate-mono-mp3';
const revision = 'neural-v1-rate-minus-10';
const maxCharactersPerMonth = 350000; // Stop before Aytim consumes the entire 500k F0 allowance.
const cacheHeaders = {
  'Content-Type': 'audio/mpeg',
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff'
};

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}

// Resolve only published curriculum entries. Do not offer an arbitrary-text TTS proxy.
export function resolveAudio(id, lang, gender) {
  if (!Object.hasOwn(voicePairs, lang) || !['m', 'f'].includes(gender) || !entries.has(id)) {
    throw failure('Unknown audio request', 404);
  }
  const entry = entries.get(id);
  const text = gender === 'f' && feminineForms[id]?.[lang]
    ? feminineForms[id][lang] : entry.text?.[lang];
  if (typeof text !== 'string' || !text.trim() || text.length > 1200) {
    throw failure('Audio is not available', 404);
  }
  return { text, voice: voicePairs[lang][gender], locale: voicePairs[lang].locale };
}

export function speechMarkup({ text, voice, locale }) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}"><voice name="${voice}"><prosody rate="-10%">${escapeXml(text)}</prosody></voice></speak>`;
}

function audioResponse(bytes) {
  return new Response(bytes, { status: 200, headers: cacheHeaders });
}

async function reserveCharacters(db, count, date) {
  if (!db) return false;
  // Atomic upsert prevents parallel cache misses from exceeding Aytim's monthly budget.
  const result = await db.prepare(`INSERT INTO azure_audio_budget (month, characters) VALUES (?, ?)
    ON CONFLICT(month) DO UPDATE SET characters = characters + excluded.characters
    WHERE characters + excluded.characters <= ?
    RETURNING characters`).bind(date.slice(0, 7), count, maxCharactersPerMonth).first();
  return Boolean(result);
}

function schedule(ctx, promise) {
  const safely = promise.catch(() => {});
  if (typeof ctx?.waitUntil === 'function') ctx.waitUntil(safely);
}

export async function audio(request, env, ctx, { fetcher = fetch, cache = globalThis.caches?.default,
  today = () => new Date().toISOString() } = {}) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' });
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
      (request.headers.has('Origin') && request.headers.get('Origin') !== new URL(request.url).origin)) {
    return json({ error: 'Same-origin audio only' }, 403);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const lang = url.searchParams.get('lang');
  const gender = url.searchParams.get('gender');
  const clip = resolveAudio(id, lang, gender);
  const digest = await hash([revision, id, lang, gender, clip.voice, clip.text, format].join('|'));
  const key = `azure/${revision}/${digest}.mp3`;
  const cacheRequest = new Request(new URL('/__aytim_audio/' + digest + '.mp3', url.origin));

  if (cache) {
    try {
      const cached = await cache.match(cacheRequest);
      if (cached) return cached;
    } catch { /* Local development or unavailable edge cache. */ }
  }
  if (env.AUDIO) {
    try {
      const stored = await env.AUDIO.get(key);
      if (stored) {
        const response = audioResponse(stored.body);
        if (cache) schedule(ctx, cache.put(cacheRequest, response.clone()));
        return response;
      }
    } catch { /* R2 outage: the protected budget still applies to regeneration. */ }
  }

  if (!env.AZURE_SPEECH_KEY || !/^[a-z0-9]+$/.test(env.AZURE_SPEECH_REGION ?? '')) {
    return json({ error: 'Speech service is not configured' }, 503);
  }
  if (!await reserveCharacters(env.DB, clip.text.length, today())) {
    return json({ error: 'Speech generation budget reached or database unavailable' }, 429);
  }
  const endpoint = `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  let azure;
  try {
    azure = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
        'X-Microsoft-OutputFormat': format,
        'Content-Type': 'application/ssml+xml',
        'User-Agent': 'AytimLanguageLearning'
      },
      body: speechMarkup(clip),
      signal: AbortSignal.timeout(12000)
    });
  } catch {
    return json({ error: 'Speech service temporarily unavailable' }, 503);
  }
  if (!azure.ok) {
    return json({ error: 'Speech service temporarily unavailable' }, 503);
  }
  const bytes = await azure.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 3 * 1024 * 1024) {
    return json({ error: 'Invalid audio response' }, 502);
  }
  if (env.AUDIO) schedule(ctx, env.AUDIO.put(key, bytes, { httpMetadata: { contentType: 'audio/mpeg' } }));
  const response = audioResponse(bytes);
  if (cache) schedule(ctx, cache.put(cacheRequest, response.clone()));
  return response;
}
