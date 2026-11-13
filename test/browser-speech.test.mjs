import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeTelegramApp, recognitionErrorKey, recognitionLocale, recognitionUnusable, recognizedSpeech, startSpeechCheck }
  from '../dist/browser-speech.mjs';
import { languages } from '../dist/content.mjs';

test('browser recognition uses each language’s locale, with a regional tag for Arabic', () => {
  assert.deepEqual(['uz', 'en', 'ru', 'ar', 'tr', 'de'].map(recognitionLocale),
    ['uz-UZ', 'en-US', 'ru-RU', 'ar-SA', 'tr-TR', 'de-DE']);
  for (const code of ['uz', 'en', 'ru', 'tr', 'de']) assert.equal(recognitionLocale(code), languages[code].locale);
  assert.equal(recognitionLocale('xx'), null);
  assert.equal(recognitionLocale('constructor'), null);
});

test('browser STT errors identify microphone, service, connectivity, and unsupported language', () => {
  assert.equal(recognitionErrorKey('audio-capture'), 'lessonSpeechMic');
  assert.equal(recognitionErrorKey('not-allowed'), 'lessonSpeechDenied');
  assert.equal(recognitionErrorKey('service-not-allowed'), 'lessonSpeechService');
  assert.equal(recognitionErrorKey('network'), 'lessonSpeechNetwork');
  assert.equal(recognitionErrorKey('language-not-supported'), 'lessonSpeechLanguage');
  assert.equal(recognitionErrorKey('no-speech'), 'lessonSpeechNoSpeech');
  assert.equal(recognitionErrorKey('aborted'), 'lessonSpeechError');
  // Only failures that a retry cannot fix send the learner to keyboard voice typing.
  for (const error of ['service-not-allowed', 'network', 'language-not-supported', 'not-allowed', 'audio-capture']) assert.ok(recognitionUnusable(error), error);
  for (const error of ['no-speech', 'aborted', 'bad-grammar']) assert.ok(!recognitionUnusable(error), error);
});

test('Telegram’s own apps are told apart from Telegram in a web browser', () => {
  for (const platform of ['android', 'android_x', 'ios', 'macos', 'tdesktop', 'unigram']) assert.ok(nativeTelegramApp({ platform }), platform);
  for (const platform of ['weba', 'webk', 'web', 'unknown']) assert.ok(!nativeTelegramApp({ platform }), platform);
  assert.ok(!nativeTelegramApp(undefined));
});

const results = (...items) => ({ results: items.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })) });

test('interim speech is visible but not a final result', () => {
  assert.deepEqual(recognizedSpeech(results(['Salom dun', false])), { transcript: 'Salom dun', final: false });
});

test('final speech takes precedence over interim results and supports Arabic', () => {
  assert.deepEqual(recognizedSpeech(results(['مرحبا', true], ['بكم', true], ['...', false])), { transcript: 'مرحبا بكم', final: true });
  assert.deepEqual(recognizedSpeech({ results: [] }), { transcript: '', final: false });
  // Engines that repeat earlier final text do not double the words.
  assert.deepEqual(recognizedSpeech(results(['good', true], ['good morning', true])), { transcript: 'good morning', final: true });
});

// A recognizer that only does what the test tells it to, and timers the test fires.
function harness({ failConstruct = false, failStart = false, failStop = false } = {}) {
  const updates = [];
  const pending = new Map();
  let next = 0;
  const timers = {
    setTimeout: (fn, ms) => { pending.set(++next, { fn, ms }); return next; },
    clearTimeout: id => pending.delete(id)
  };
  let recognizer;
  class Recognition {
    constructor() {
      if (failConstruct) throw new Error('blocked');
      recognizer = this;
      this.calls = [];
    }
    start() { this.calls.push('start'); if (failStart) throw new Error('busy'); }
    stop() { this.calls.push('stop'); if (failStop) throw new Error('gone'); }
    abort() { this.calls.push('abort'); }
  }
  const check = startSpeechCheck({ Recognition, lang: 'en-US', onUpdate: update => updates.push(update), timers });
  const emit = (type, data = {}) => recognizer?.['on' + type]?.(data);
  const fire = () => { for (const [id, { fn }] of [...pending]) { pending.delete(id); fn(); } };
  return { check, updates, emit, fire, pending, recognizer: () => recognizer };
}

test('a final result ends the attempt at once, without waiting for the browser’s end event', () => {
  const run = harness();
  assert.equal(run.recognizer().lang, 'en-US');
  assert.equal(run.recognizer().interimResults, true);
  run.emit('result', results(['good', false]));
  run.emit('result', results(['good morning', true]));
  assert.deepEqual(run.updates, [{ state: 'listening' }, { state: 'listening', partial: 'good' }, { state: 'done', transcript: 'good morning' }]);
  assert.ok(run.recognizer().calls.includes('abort'), 'the recognizer is released');
  // Nothing the browser sends later changes the outcome.
  run.emit('end'); run.emit('error', { error: 'network' });
  assert.equal(run.updates.length, 3);
});

test('without a final result, the last interim text is still checked', () => {
  const run = harness();
  run.emit('result', results(['good morn', false]));
  run.check.stop();
  run.emit('end');
  assert.deepEqual(run.updates.slice(-2), [{ state: 'stopping' }, { state: 'done', transcript: 'good morn' }]);
});

test('a stop the browser never answers still ends the attempt', () => {
  const heard = harness();
  heard.emit('result', results(['good', false]));
  heard.check.stop();
  assert.deepEqual([...heard.pending.values()].map(timer => timer.ms), [4000]);
  heard.fire();
  assert.deepEqual(heard.updates.at(-1), { state: 'done', transcript: 'good' });
  const silent = harness();
  silent.check.stop();
  silent.fire();
  assert.deepEqual(silent.updates.at(-1), { state: 'done' });
  // A stop() the browser refuses ends the attempt straight away.
  const refused = harness({ failStop: true });
  refused.check.stop();
  assert.deepEqual(refused.updates.at(-1), { state: 'done' });
});

test('stopping before saying anything is a cancel, not a browser failure', () => {
  for (const event of [['end'], ['error', { error: 'aborted' }], ['error', { error: 'no-speech' }]]) {
    const run = harness();
    run.check.stop();
    run.emit(...event);
    assert.deepEqual(run.updates.at(-1), { state: 'done' }, event[0]);
    assert.equal(run.pending.size, 0, 'the watchdog is cleared');
  }
  // The browser ending on its own with nothing heard is reported.
  const ended = harness();
  ended.emit('end');
  assert.deepEqual(ended.updates.at(-1), { state: 'done', key: 'lessonSpeechStopped' });
});

test('errors and unrecognized speech give their own messages', () => {
  const service = harness();
  service.emit('error', { error: 'service-not-allowed' });
  assert.deepEqual(service.updates.at(-1), { state: 'done', key: 'lessonSpeechService', unusable: true });
  const silence = harness();
  silence.emit('error', { error: 'no-speech' });
  assert.deepEqual(silence.updates.at(-1), { state: 'done', key: 'lessonSpeechNoSpeech', unusable: false });
  const unclear = harness();
  unclear.emit('nomatch');
  assert.deepEqual(unclear.updates.at(-1), { state: 'done', key: 'lessonSpeechNoMatch' });
  for (const run of [service, silence, unclear]) assert.equal(run.updates.filter(update => update.state === 'done').length, 1);
});

test('a recognizer that cannot be created or started reports the service as unusable', () => {
  for (const options of [{ failConstruct: true }, { failStart: true }]) {
    const run = harness(options);
    assert.equal(run.check, null);
    assert.deepEqual(run.updates, [{ state: 'done', key: 'lessonSpeechService', unusable: true }]);
  }
});

test('leaving the question cancels quietly', () => {
  const run = harness();
  run.check.cancel();
  run.emit('result', results(['good morning', true]));
  run.emit('end');
  assert.deepEqual(run.updates, [{ state: 'listening' }]);
  assert.ok(run.recognizer().calls.includes('abort'));
  assert.equal(run.recognizer().onresult, null);
});

test('every speaking message exists in all six interface languages', async () => {
  const { copy } = await import('../dist/copy.mjs');
  const keys = ['lessonFlowSpeak', 'lessonSpeechStart', 'lessonSpeechStop', 'lessonSpeechListening', 'lessonSpeechProcessing',
    'lessonSpeechPartial', 'lessonSpeechMatch', 'lessonSpeechMismatch', 'lessonSpeechHeard', 'lessonSpeechNoSpeech',
    'lessonSpeechNoMatch', 'lessonSpeechNetwork', 'lessonSpeechService', 'lessonSpeechMic', 'lessonSpeechLanguage',
    'lessonSpeechStopped', 'lessonSpeechDenied', 'lessonSpeechUnavailable', 'lessonSpeechError', 'lessonSpeechPrivacy',
    'dictateOpen', 'dictateLabel', 'dictateHint', 'dictateDesktopHint', 'dictateEmpty'];
  assert.equal(Object.keys(copy).length, 6);
  for (const [code, strings] of Object.entries(copy)) for (const key of keys) assert.ok(strings[key]?.trim(), code + ': ' + key);
  // No message sends a learner to another browser: inside Telegram there is none to switch to.
  for (const [code, strings] of Object.entries(copy)) {
    for (const key of keys) assert.doesNotMatch(strings[key], /Chrome|Safari/, code + ': ' + key);
  }
});
