import { newCourse, pairKey, validPair } from '../dist/engine.mjs';
import { accessibleLevel, entryRevealed, path } from '../dist/journey.mjs';
import { matchesReference } from '../dist/skill-lab.mjs';
import { appKeyboard, chatLabel, chatLanguage, homeButton, navigationButton, primaryButton } from './telegram-navigation.mjs';
import { chatText as t } from './telegram-copy.mjs';
import { messageText } from './telegram-rich.mjs';
import { failure, rawBody } from './http.mjs';
import { budgetFor, maxSeconds, recognizers, reserveSeconds, whisperTranscript } from './recognition.mjs';
import { resolveAudio } from './speech.mjs';

const promptLifetime = 15 * 60 * 1000;
const maxVoiceBytes = 512 * 1024;

function speakingKeyboard(env, base) {
  return { inline_keyboard: [
    [primaryButton(navigationButton('speaking', base, t(base,'newPhrase')))],
    [homeButton(base)],
    ...(appKeyboard(env, undefined, base, undefined, { primary: false })?.inline_keyboard ?? [])
  ] };
}

const send = (env, call, id, base, content, extra = {}) => call(env, 'sendMessage', {
  chat_id: id, ...(typeof content === 'string' ? messageText(chatLabel('speaking',base), [content]) : content),
  reply_markup: speakingKeyboard(env,base), ...extra
});

export async function startSpeaking(env, call, id, learner, state, base = state?.base) {
  if (!validPair(state?.base, state?.target))
    return send(env, call, id, base, t(base,'choosePair'));
  if (recognizers[state.target]?.provider !== 'workers-ai')
    return send(env, call, id, base, t(base,'uzbekSpeaking'), { reply_markup: appKeyboard(env,undefined,base) });
  if (typeof env.AI?.run !== 'function')
    return send(env, call, id, base, t(base,'voiceUnavailable') + ' ' + t(base,'speakInApp'));

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
  const message = await send(env, call, id, base, messageText(chatLabel('speaking',base), [
    chatLanguage(state.target,base),
    { text: reference, bold: true },
    t(base,'voiceInstruction',{n:maxSeconds}),
    t(base,'voicePrivacy')
  ]));
  if (!message?.message_id) return;
  await env.DB.prepare(`
    INSERT INTO bot_speaking_prompts (telegram_id,learner_id,message_id,pair,entry_id,reference,expires_at)
    SELECT telegram_id,learner_id,?,?,?,?,? FROM telegram_accounts WHERE telegram_id=? AND learner_id=?
    ON CONFLICT(telegram_id) DO UPDATE SET message_id=excluded.message_id,pair=excluded.pair,
      learner_id=excluded.learner_id,entry_id=excluded.entry_id,reference=excluded.reference,expires_at=excluded.expires_at
    WHERE excluded.message_id>bot_speaking_prompts.message_id
  `).bind(message.message_id, pair, entry.id, reference, now + promptLifetime, id, learner.id).run();
}

// Some Telegram recorders flush complete pages without marking the final page
// as end-of-stream. Read the last completed packet's timestamp on the 48 kHz clock.
export function opusDuration(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start, length) => String.fromCharCode(...bytes.subarray(start, start + length));
  let offset = 0, serial, preSkip, lastSamples = 0, continued = false;
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
    } else if (serial !== stream || (flags & 2) || Boolean(flags & 1) !== continued) {
      return null;
    }
    const samples = Number(view.getBigInt64(offset + 6, true));
    if (!Number.isSafeInteger(samples) || samples < -1 || (samples >= 0 && samples < lastSamples)) return null;
    if (samples >= 0) lastSamples = samples;
    continued = segments ? bytes[start - 1] === 255 : continued;
    if ((flags & 4) && next !== bytes.length) return null;
    offset = next;
  }
  return offset === bytes.length && !continued && lastSamples > preSkip
    ? (lastSamples - preSkip) / 48000
    : null;
}

async function downloadVoice(env, call, voice) {
  if (!voice.file_id) throw failure('Missing Telegram voice file ID');
  const file = await call(env, 'getFile', { file_id: voice.file_id });
  const path = file?.file_path;
  // getFile returns a relative path. Validate the path here and the audio format
  // from the downloaded bytes, independently of Telegram's filename.
  if (typeof path !== 'string' || !/^[\w-][\w.-]*(?:\/[\w-][\w.-]*)*$/.test(path))
    throw failure('Invalid Telegram voice file path');
  if (file.file_size > maxVoiceBytes) throw failure('Telegram voice note is too large', 413);
  const response = await fetch('https://api.telegram.org/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + path, {
    // Workers supports manual redirects. The status check below rejects them.
    redirect: 'manual', signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw failure('Telegram voice download failed', response.status);
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

export async function checkSpeaking(env, call, id, message, fallbackBase) {
  const reply = {
    reply_parameters: { message_id: message.message_id, allow_sending_without_reply: true }
  };
  const prompt = await activePrompt(env, id);
  const base = prompt?.pair.split('>')[0] ?? fallbackBase;
  const noPrompt = t(base,'noVoicePrompt');
  const replyTo = message.reply_to_message?.message_id;
  if (!prompt || message.message_id <= prompt.message_id ||
      (replyTo != null && replyTo !== prompt.message_id) || message.external_reply)
    return send(env, call, id, base, noPrompt, reply);

  // Recheck after recognition in case the learner changed course, account or prompt.
  const feedback = await speakingFeedback(env, call, id, prompt, message.voice);
  const current = await activePrompt(env, id);
  return send(env, call, id, base, current?.message_id === prompt.message_id ? feedback : noPrompt, reply);
}

async function speakingFeedback(env, call, id, prompt, voice) {
  const [base,target] = prompt.pair.split('>');
  const language = recognizers[target]?.language;
  if (!language || typeof env.AI?.run !== 'function') return t(base,'voiceUnavailable') + ' ' + t(base,'speakInApp');
  const tooLong = t(base,'voiceLength',{n:maxSeconds});
  if (voice.duration > maxSeconds || voice.file_size > maxVoiceBytes) return tooLong;
  if (env.SPEECH_LIMITER && !(await env.SPEECH_LIMITER.limit({ key: 'telegram-speech:' + id })).success)
    return t(base,'waitRetry');
  let audio;
  try {
    audio = await downloadVoice(env, call, voice);
  } catch (error) {
    if (error.status === 413) return tooLong;
    console.warn('Telegram speaking voice download failed', { status: error.status ?? error.code ?? null });
    return t(base,'voiceDownload');
  }
  const seconds = opusDuration(audio);
  if (seconds === null) {
    console.warn('Telegram speaking voice format could not be read', { size: audio.byteLength });
    return t(base,'voiceFormat');
  }
  if (seconds > maxSeconds) return tooLong;
  if (seconds < 0.3) return t(base,'voiceShort');
  const budget = budgetFor('workers-ai', env, new Date().toISOString());
  if (!await reserveSeconds(env.DB, budget, Math.ceil(seconds)))
    return t(base,'voiceLimit');

  let transcript;
  try {
    transcript = await whisperTranscript(audio, language, env);
  } catch {
    return t(base,'voiceCheck');
  }
  if (!transcript) return t(base,'voiceEmpty');
  const matched = matchesReference(transcript, prompt.reference, target);
  return (matched ? t(base,'voiceMatch') : t(base,'voiceMismatch')) +
    '\n\n' + t(base,'sample',{answer:prompt.reference}) + '\n' + t(base,'transcript',{answer:transcript}) +
    (matched ? '' : '\n\n' + t(base,'voiceTryAgain'));
}
