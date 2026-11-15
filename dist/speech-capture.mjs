// Speaking checks record the learner in the page and send one short clip to Aytim's
// Worker, which asks a speech recognition service for the text (Azure for Uzbek,
// Whisper on Cloudflare for the other languages). This works wherever the page can open
// the microphone, including Telegram's own apps, which have no browser speech recognition.
// Neither the audio nor the transcript is stored or saved with progress.

export const captureRate = 16000;
export const maxRecordSeconds = 12;
// Quieter than this (RMS of a 20 ms frame) counts as silence: about -50 dBFS.
const silence = 0.003;
const padding = 0.3;

// Box-filter downsampling (a cheap low-pass), or linear interpolation when upsampling.
export function downsample(input, fromRate, toRate = captureRate) {
  if (fromRate === toRate) return Float32Array.from(input);
  const ratio = fromRate / toRate;
  const output = new Float32Array(Math.floor(input.length / ratio));
  for (let index = 0; index < output.length; index++) {
    if (ratio >= 1) {
      const start = Math.floor(index * ratio);
      const end = Math.max(start + 1, Math.min(input.length, Math.floor((index + 1) * ratio)));
      let sum = 0;
      for (let at = start; at < end; at++) sum += input[at];
      output[index] = sum / (end - start);
    } else {
      const position = index * ratio;
      const left = Math.floor(position);
      const right = Math.min(input.length - 1, left + 1);
      output[index] = input[left] + (input[right] - input[left]) * (position - left);
    }
  }
  return output;
}

// The speech in a clip without its leading and trailing silence (with a little margin),
// or null when nothing louder than silence was recorded.
export function trimSilence(samples, rate = captureRate) {
  const frame = Math.max(1, Math.round(rate * 0.02));
  let first = -1;
  let last = -1;
  for (let start = 0; start < samples.length; start += frame) {
    let sum = 0;
    const end = Math.min(samples.length, start + frame);
    for (let at = start; at < end; at++) sum += samples[at] * samples[at];
    if (Math.sqrt(sum / (end - start)) > silence) {
      if (first < 0) first = start;
      last = end;
    }
  }
  if (first < 0) return null;
  const margin = Math.round(rate * padding);
  return samples.subarray(Math.max(0, first - margin), Math.min(samples.length, last + margin));
}

// 16-bit PCM mono WAV, the one format every recognizer Aytim uses accepts.
export function encodeWav(samples, rate = captureRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset, value) => { for (let index = 0; index < 4; index++) view.setUint8(offset + index, value.charCodeAt(index)); };
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return buffer;
}

// Everything recorded, as one 16 kHz clip of the speech in it (null when it was silent).
export function clipFrom(chunks, rate, maxSeconds = maxRecordSeconds) {
  const length = Math.min(chunks.reduce((sum, chunk) => sum + chunk.length, 0), Math.floor(rate * maxSeconds));
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= length) break;
    const part = chunk.subarray(0, length - offset);
    merged.set(part, offset);
    offset += part.length;
  }
  const speech = trimSilence(downsample(merged, rate));
  if (!speech) return null;
  return { wav: new Blob([encodeWav(speech)], { type: 'audio/wav' }), seconds: speech.length / captureRate };
}

export function speechCaptureSupported(win = globalThis) {
  return Boolean(win.navigator?.mediaDevices?.getUserMedia && (win.AudioContext ?? win.webkitAudioContext));
}

// What a failed microphone request means for the learner. `microphone` marks failures
// that retrying on this device will not fix.
export function microphoneOutcome(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError': return { key: 'lessonSpeechDenied', microphone: true };
    case 'NotReadableError':
    case 'AbortError': return { key: 'lessonSpeechMic' };
    default: return { key: 'lessonSpeechMic', microphone: true };
  }
}

// Telegram's Android app asks for the microphone on every request, so one stream is kept
// open while the learner is on a speaking question, and released when they leave it.
let held = null;

async function microphone(win) {
  if (held?.getAudioTracks().some(track => track.readyState === 'live')) return held;
  held = null;
  const stream = await win.navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
  });
  held = stream;
  return stream;
}

export function releaseMicrophone() {
  held?.getTracks().forEach(track => track.stop());
  held = null;
}

// Starts recording. Call it from the click handler: the audio context is created before
// the first await, while the browser still treats the page as handling a user gesture.
// Resolves to { stop() → clip or null, cancel() }. `onLimit` runs when the time limit is reached.
export async function startSpeechCapture({ win = globalThis, onLimit, maxSeconds = maxRecordSeconds } = {}) {
  const Context = win.AudioContext ?? win.webkitAudioContext;
  const context = new Context();
  context.resume?.().catch(() => {});
  let stream;
  try { stream = await microphone(win); }
  catch (error) { context.close?.().catch(() => {}); throw error; }
  const source = context.createMediaStreamSource(stream);
  // ScriptProcessorNode is deprecated but is the one capture node every web view still has.
  const processor = context.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  let length = 0;
  let ended = false;
  processor.onaudioprocess = event => {
    if (ended) return;
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    length += event.inputBuffer.length;
    if (length >= context.sampleRate * maxSeconds) onLimit?.();
  };
  source.connect(processor);
  // Chrome only runs the processor when it is connected; it outputs silence.
  processor.connect(context.destination);
  const close = () => {
    if (ended) return;
    ended = true;
    processor.onaudioprocess = null;
    try { source.disconnect(); processor.disconnect(); } catch { /* Already disconnected. */ }
    context.close?.().catch(() => {});
  };
  return {
    stop() { close(); return clipFrom(chunks, context.sampleRate, maxSeconds); },
    cancel: close
  };
}

// Sends a clip to the Worker. Resolves to { transcript } or to a message key; `server`
// marks answers meaning Aytim's speech check is unavailable (not configured, over budget,
// or a static host without the Worker), so the page falls back for the rest of the session.
export async function recognizeClip(wav, lang, fetcher = globalThis.fetch) {
  let response;
  try {
    response = await fetcher('/api/speech?' + new URLSearchParams({ lang }), {
      method: 'POST', credentials: 'same-origin', body: wav,
      headers: { 'X-Aytim-Client': '1', 'Content-Type': 'audio/wav' }
    });
  } catch {
    return { key: 'lessonSpeechNetwork' };
  }
  let data = null;
  try { data = await response.json(); } catch { /* Not the Worker's answer. */ }
  if (response.ok && typeof data?.transcript === 'string') {
    return data.transcript.trim() ? { transcript: data.transcript.trim() } : { key: 'lessonSpeechNoSpeech' };
  }
  if (response.status === 429 && data?.reason === 'rate') return { key: 'lessonSpeechBusy' };
  if (response.status === 413) return { key: 'lessonSpeechError' };
  return { key: 'lessonSpeechServer', server: true };
}
