import { languages } from './content.mjs';

// Speech checks use only what the device offers: the browser's Web Speech API, or
// the keyboard's own voice typing. Audio and transcripts never reach Aytim.

// Arabic lessons teach Modern Standard Arabic; recognizers need a regional tag for it.
export function recognitionLocale(code) {
  if (!Object.hasOwn(languages, code)) return null;
  return code === 'ar' ? 'ar-SA' : languages[code].locale;
}

// A working microphone and a working recognition service are different things.
export function recognitionErrorKey(error) {
  switch (error) {
    case 'not-allowed': return 'lessonSpeechDenied';
    case 'service-not-allowed': return 'lessonSpeechService';
    case 'audio-capture': return 'lessonSpeechMic';
    case 'language-not-supported': return 'lessonSpeechLanguage';
    case 'network': return 'lessonSpeechNetwork';
    case 'no-speech': return 'lessonSpeechNoSpeech';
    default: return 'lessonSpeechError';
  }
}

// Errors after which trying the microphone again on this device will not help.
const unusable = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported', 'network']);
export const recognitionUnusable = error => unusable.has(error);

// Telegram's own apps (phone and desktop) show a Mini App in a system web view
// that has no speech recognition service. Telegram in a web browser runs inside
// that browser, so it keeps the microphone.
const nativeTelegram = new Set(['android', 'android_x', 'ios', 'macos', 'tdesktop', 'unigram']);
export const nativeTelegramApp = webApp => nativeTelegram.has(webApp?.platform);

// Some engines repeat earlier final text in later results ("good", "good morning").
function joined(parts) {
  let text = '';
  for (const part of parts) {
    if (!text || part.startsWith(text)) text = part;
    else if (!text.endsWith(part)) text += ' ' + part;
  }
  return text;
}

// Interim text shows the learner that they are heard. A final transcript is checked;
// interim text only when the browser ends without one.
export function recognizedSpeech(event) {
  const final = [];
  const partial = [];
  const results = event?.results ?? [];
  for (let index = 0; index < results.length; index++) {
    const transcript = String(results[index]?.[0]?.transcript ?? '').trim();
    if (transcript) (results[index].isFinal ? final : partial).push(transcript);
  }
  return final.length ? { transcript: joined(final), final: true } : { transcript: joined(partial), final: false };
}

// One attempt at recognizing a phrase. `onUpdate` receives:
//   { state: 'listening', partial? }        while listening (with interim text when there is some)
//   { state: 'stopping' }                   after stop(), until the browser answers
//   { state: 'done', transcript }           text to check against the phrase
//   { state: 'done', key, unusable? }       a message to show instead
//   { state: 'done' }                       cancelled by the learner before anything was heard
// Every attempt ends with exactly one 'done', even when the browser never sends `end`.
export function startSpeechCheck({ Recognition, lang, onUpdate, wait = 4000, timers = globalThis }) {
  let recognition;
  try { recognition = new Recognition(); }
  catch { onUpdate({ state: 'done', key: 'lessonSpeechService', unusable: true }); return null; }
  let heard = '';
  let stopping = false;
  let finished = false;
  let watchdog = null;
  const quiet = () => {
    recognition.onstart = recognition.onresult = recognition.onnomatch = recognition.onerror = recognition.onend = null;
  };
  const finish = outcome => {
    if (finished) return;
    finished = true;
    timers.clearTimeout(watchdog);
    quiet();
    try { recognition.abort(); } catch { /* Already ended. */ }
    onUpdate({ state: 'done', ...outcome });
  };
  // Without a final result, the last interim text is still what the learner said.
  const settle = () => finish(heard ? { transcript: heard } : stopping ? {} : { key: 'lessonSpeechStopped' });

  recognition.lang = lang;
  recognition.continuous = false; // A short phrase, not open-ended capture.
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.onresult = event => {
    const { transcript, final } = recognizedSpeech(event);
    if (!transcript) return;
    if (final) finish({ transcript });
    else {
      heard = transcript;
      if (!stopping) onUpdate({ state: 'listening', partial: transcript });
    }
  };
  recognition.onnomatch = () => finish({ key: 'lessonSpeechNoMatch' });
  recognition.onerror = event => {
    // Stopping early can surface as 'aborted' or 'no-speech'; that is the learner's choice, not a failure.
    if (stopping && ['aborted', 'no-speech'].includes(event.error)) settle();
    else finish({ key: recognitionErrorKey(event.error), unusable: recognitionUnusable(event.error) });
  };
  recognition.onend = settle;
  try { recognition.start(); }
  catch { finish({ key: 'lessonSpeechService', unusable: true }); return null; }
  onUpdate({ state: 'listening' });

  return {
    // The learner pressed the button again: ask for the final text, but never wait for ever.
    stop() {
      if (finished || stopping) return;
      stopping = true;
      onUpdate({ state: 'stopping' });
      try { recognition.stop(); } catch { settle(); return; }
      watchdog = timers.setTimeout(settle, wait);
    },
    // Leaving the question: end quietly, without reporting anything.
    cancel() {
      if (finished) return;
      finished = true;
      timers.clearTimeout(watchdog);
      quiet();
      try { recognition.abort(); } catch { /* Already ended. */ }
    }
  };
}
