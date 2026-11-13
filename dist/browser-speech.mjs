// Browser-native Web Speech recognition helpers; no Azure or Aytim STT service.
export const recognitionLocales = Object.freeze({
  uz: 'uz-UZ', en: 'en-US', ru: 'ru-RU', ar: 'ar-SA',
  tr: 'tr-TR', de: 'de-DE'
});

export function recognitionLocale(code) {
  return recognitionLocales[code] ?? null;
}

// A working microphone and a working browser recognition service are different things.
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

// Interim transcriptions help the learner see whether the browser is hearing them.
// Only a final transcript may count toward the existing reference-text comparison.
export function recognizedSpeech(event) {
  const results = event?.results;
  if (!results?.length) return { transcript: '', final: false };
  const final = [];
  const partial = [];
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const transcript = String(result?.[0]?.transcript ?? '').trim();
    if (!transcript) continue;
    (result.isFinal ? final : partial).push(transcript);
  }
  return final.length
    ? { transcript: final.join(' ').trim(), final: true }
    : { transcript: partial.join(' ').trim(), final: false };
}
