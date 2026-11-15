import { newCourse, pairKey, validPair } from '../dist/engine.mjs';
import { accessibleLevel, entryRevealed, path } from '../dist/journey.mjs';
import { matchesReference } from '../dist/skill-lab.mjs';
import { appKeyboard, navigationActions } from './telegram-navigation.mjs';
import { rawBody } from './http.mjs';
import { budgetFor, maxSeconds, recognizers, reserveSeconds, whisperTranscript } from './recognition.mjs';
import { resolveAudio } from './speech.mjs';

const promptLifetime = 15 * 60 * 1000;
const maxVoiceBytes = 512 * 1024;
const miniApp = 'Gapirish mashqini Aytim ilovasida oching.';
const noPrompt = 'Ovozli xabarni tekshirish uchun Gapirish mashqida yangi iborani oching.';

function speakingKeyboard(env) {
  return { inline_keyboard: [
    [{ text: '🎙 Yangi ibora', callback_data: navigationActions.speaking },
      { text: '🏠 Bosh menyu', callback_data: navigationActions.home }],
    ...(appKeyboard(env)?.inline_keyboard ?? [])
  ] };
}

const send = (env, call, id, text, extra = {}) => call(env, 'sendMessage', {
  chat_id: id, text, reply_markup: speakingKeyboard(env), ...extra
});

export async function startSpeaking(env, call, id, learner, state) {
  if (!validPair(state?.base, state?.target))
    return send(env, call, id, 'Avval Aytim ilovasida til yo‘nalishini tanlang.');
  if (recognizers[state.target]?.provider !== 'workers-ai')
    return send(env, call, id, 'O‘zbekcha gapirish mashqi Aytim ilovasida mavjud.', { reply_markup: appKeyboard(env) });
  if (typeof env.AI?.run !== 'function')
    return send(env, call, id, 'Ovoz tekshiruvi hozircha mavjud emas. ' + miniApp);

  const pair = pairKey(state.base, state.target);
  const course = state.courses?.[pair] ?? newCourse();
  const level = accessibleLevel(course);
  const current = path[level - 1].units.flatMap(unit => unit.phrases);
  const familiar = current.filter(entry => entryRevealed(course, entry, level));
  const entries = familiar.length ? familiar : path[level - 1].units[0].phrases;
  const previous = await env.DB.prepare('SELECT entry_id FROM bot_speaking_prompts WHERE telegram_id=?')
    .bind(id).first();
  const fresh = entries.filter(entry => entry.id !== previous?.entry_id);
  const pool = fresh.length ? fresh : entries;
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const reference = resolveAudio(entry.id, state.target, state.speaker === 'f' ? 'f' : 'm').text;
  const now = Date.now();
  await env.DB.prepare(`
    DELETE FROM bot_speaking_prompts WHERE telegram_id IN (
      SELECT telegram_id FROM bot_speaking_prompts WHERE expires_at<? LIMIT 20
    )
  `).bind(now).run();
  const message = await send(env, call, id,
    '🎙 Gapirish · ' + state.target.toUpperCase() + '\n\n' + reference +
    '\n\nIborani ayting va shu chatga ' + maxSeconds + ' soniyagacha ovozli xabar yuboring.' +
    '\nAytim ovozni matnga aylantiradi. Yozuv va matn Telegram chatida qoladi.');
  if (!message?.message_id) return;
  await env.DB.prepare(`
    INSERT INTO bot_speaking_prompts (telegram_id,learner_id,message_id,pair,entry_id,reference,expires_at)
    SELECT telegram_id,learner_id,?,?,?,?,? FROM telegram_accounts WHERE telegram_id=? AND learner_id=?
    ON CONFLICT(telegram_id) DO UPDATE SET message_id=excluded.message_id,pair=excluded.pair,
      learner_id=excluded.learner_id,entry_id=excluded.entry_id,reference=excluded.reference,expires_at=excluded.expires_at
    WHERE excluded.message_id>bot_speaking_prompts.message_id
  `).bind(message.message_id, pair, entry.id, reference, now + promptLifetime, id, learner.id).run();
}

// Telegram records Opus in Ogg. Measure the finished stream on Opus's 48 kHz
// clock, independent of the duration supplied with the message.
export function opusDuration(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start, length) => String.fromCharCode(...bytes.subarray(start, start + length));
  let offset = 0, serial, preSkip;
  while (offset + 27 <= bytes.length) {
    if (ascii(offset, 4) !== 'OggS' || bytes[offset + 4] !== 0) return null;
    const flags = bytes[offset + 5];
    const stream = view.getUint32(offset + 14, true);
    const segments = bytes[offset + 26];
    const start = offset + 27 + segments;
    if (start > bytes.length) return null;
    const size = bytes.subarray(offset + 27, start).reduce((total, size) => total + size, 0);
    const next = start + size;
    if (next > bytes.length) return null;
    if (offset === 0) {
      if (!(flags & 2) || size < 19 || ascii(start, 8) !== 'OpusHead') return null;
      serial = stream;
      preSkip = view.getUint16(start + 10, true);
    } else if (serial !== stream || (flags & 2)) return null;
    if (flags & 4) {
      const samples = Number(view.getBigUint64(offset + 6, true)) - preSkip;
      return next === bytes.length && Number.isSafeInteger(samples) && samples > 0 ? samples / 48000 : null;
    }
    offset = next;
  }
  return null;
}

async function downloadVoice(env, call, voice) {
  if (!voice.file_id) return null;
  const file = await call(env, 'getFile', { file_id: voice.file_id });
  if (!/^voice\/[a-zA-Z0-9_-]+\.(oga|ogg|opus)$/.test(file?.file_path ?? '')) return null;
  const response = await fetch('https://api.telegram.org/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + file.file_path, {
    redirect: 'error', signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) return null;
  return rawBody(response, maxVoiceBytes, 'Missing voice note');
}

function activePrompt(env, id) {
  return env.DB.prepare(`
    SELECT p.* FROM bot_speaking_prompts p JOIN telegram_accounts a ON a.telegram_id=p.telegram_id
      JOIN learners l ON l.id=a.learner_id AND l.id=p.learner_id
    WHERE p.telegram_id=? AND p.expires_at>?
      AND p.pair=json_extract(l.state_json,'$.base')||'>'||json_extract(l.state_json,'$.target')
  `).bind(id, Date.now()).first();
}

export async function checkSpeaking(env, call, id, message) {
  const reply = {
    reply_parameters: { message_id: message.message_id, allow_sending_without_reply: true }
  };
  const prompt = await activePrompt(env, id);
  const replyTo = message.reply_to_message?.message_id;
  if (!prompt || message.message_id <= prompt.message_id ||
      (replyTo != null && replyTo !== prompt.message_id) || message.external_reply)
    return send(env, call, id, noPrompt, reply);

  // Recheck after recognition in case the learner changed course, account or prompt.
  const feedback = await speakingFeedback(env, call, id, prompt, message.voice);
  const current = await activePrompt(env, id);
  return send(env, call, id, current?.message_id === prompt.message_id ? feedback : noPrompt, reply);
}

async function speakingFeedback(env, call, id, prompt, voice) {
  const target = prompt.pair.split('>')[1];
  const language = recognizers[target]?.language;
  if (!language || typeof env.AI?.run !== 'function') return 'Ovoz tekshiruvi hozircha mavjud emas. ' + miniApp;
  const tooLong = maxSeconds + ' soniyagacha ovozli xabar yuboring.';
  if (voice.duration > maxSeconds || voice.file_size > maxVoiceBytes) return tooLong;
  if (env.SPEECH_LIMITER && !(await env.SPEECH_LIMITER.limit({ key: 'telegram-speech:' + id })).success)
    return 'Biroz kutib, yana urinib ko‘ring.';
  let audio;
  try {
    audio = await downloadVoice(env, call, voice);
  } catch (error) {
    if (error.status === 413) return tooLong;
  }
  const seconds = audio && opusDuration(audio);
  if (!seconds) return 'Ovozli xabarni o‘qib bo‘lmadi. Telegram mikrofoni orqali qayta yozib yuboring.';
  if (seconds > maxSeconds) return tooLong;
  if (seconds < 0.3) return 'Ovozli xabar juda qisqa. Iborani to‘liq aytib, qayta yuboring.';
  const budget = budgetFor('workers-ai', env, new Date().toISOString());
  if (!await reserveSeconds(env.DB, budget, Math.ceil(seconds)))
    return 'Bugungi ovoz tekshiruvi limiti tugadi.';

  let transcript;
  try {
    transcript = await whisperTranscript(audio, language, env);
  } catch {
    return 'Ovozni hozir tekshirib bo‘lmadi. Keyinroq qayta urinib ko‘ring.';
  }
  if (!transcript) return 'So‘zlar eshitilmadi. Iborani aytib, qayta yuboring.';
  const matched = matchesReference(transcript, prompt.reference, target);
  return (matched ? '✓ Matn iboraga mos keldi.' : 'Matn iboraga mos kelmadi.') +
    '\n\nNamuna: ' + prompt.reference + '\nEshitilgan matn: ' + transcript +
    (matched ? '' : '\n\nQayta urinish uchun ovozli xabar yuboring.');
}
