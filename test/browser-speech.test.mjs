import test from 'node:test';
import assert from 'node:assert/strict';
import { recognitionErrorKey, recognitionLocale, recognizedSpeech } from '../dist/browser-speech.mjs';

test('browser recognition uses explicit locale for all six target languages', () => {
  assert.deepEqual(['uz', 'en', 'ru', 'ar', 'tr', 'de'].map(recognitionLocale),
    ['uz-UZ', 'en-US', 'ru-RU', 'ar-SA', 'tr-TR', 'de-DE']);
  assert.equal(recognitionLocale('xx'), null);
});

test('browser STT errors identify microphone, service, connectivity, and unsupported language', () => {
  assert.equal(recognitionErrorKey('audio-capture'), 'lessonSpeechMic');
  assert.equal(recognitionErrorKey('not-allowed'), 'lessonSpeechDenied');
  assert.equal(recognitionErrorKey('service-not-allowed'), 'lessonSpeechService');
  assert.equal(recognitionErrorKey('network'), 'lessonSpeechNetwork');
  assert.equal(recognitionErrorKey('language-not-supported'), 'lessonSpeechLanguage');
  assert.equal(recognitionErrorKey('no-speech'), 'lessonSpeechNoSpeech');
  assert.equal(recognitionErrorKey('aborted'), 'lessonSpeechError');
});

test('interim speech is visible but not a final result', () => {
  const result = [{ 0: { transcript: 'Salom dun' }, isFinal: false, length: 1 }];
  assert.deepEqual(recognizedSpeech({ results: result }),
    { transcript: 'Salom dun', final: false });
});

test('final speech takes precedence over interim results and supports Arabic', () => {
  const result = [
    { 0: { transcript: 'مرحبا' }, isFinal: true, length: 1 },
    { 0: { transcript: 'بكم' }, isFinal: true, length: 1 },
    { 0: { transcript: '...' }, isFinal: false, length: 1 }
  ];
  assert.deepEqual(recognizedSpeech({ results: result }),
    { transcript: 'مرحبا بكم', final: true });
  assert.deepEqual(recognizedSpeech({ results: [] }),
    { transcript: '', final: false });
});
