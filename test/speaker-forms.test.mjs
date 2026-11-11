import test from 'node:test';
import assert from 'node:assert/strict';
import { phrases } from '../dist/content.mjs';
import { applySpeakerForms, feminineForms } from '../dist/speaker-forms.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { buildLessonActivities } from '../dist/lesson-flow.mjs';
import { units } from '../dist/content.mjs';
import { newCourse } from '../dist/engine.mjs';
import { copy } from '../dist/copy.mjs';

const byId = new Map(phrases.map(entry => [entry.id, entry]));

test('feminine speaker forms replace only the gendered wording and switch back', () => {
  const before = new Map(phrases.map(entry => [entry.id, JSON.stringify([entry.text, entry.romanization])]));
  assert.equal(applySpeakerForms('f'), 'f');
  for (const [id, forms] of Object.entries(feminineForms)) {
    const entry = byId.get(id);
    assert.ok(entry, id + ' is not a lesson phrase');
    for (const [code, value] of Object.entries(forms)) {
      if (code === 'romanization') {
        assert.equal(entry.romanization, value);
        assert.ok(forms.ar, id + ': romanization belongs with an Arabic change');
      } else {
        assert.ok(['ru', 'ar', 'de'].includes(code), id + ' ' + code);
        assert.equal(entry.text[code], value);
        assert.notEqual(JSON.parse(before.get(id))[0][code], value, id + ' ' + code + ' is not different');
      }
    }
    if (forms.ar) assert.ok(forms.romanization, id + ': Arabic change needs its reading aid');
  }
  assert.equal(byId.get('introductions-5').text.ru, 'Я студентка.');
  assert.equal(byId.get('introductions-5').text.de, 'Ich bin Studentin.');
  assert.equal(byId.get('introductions-5').text.en, 'I’m a student.');
  const lesson = buildLessonActivities(units.find(unit => unit.id === 'wellbeing'), newCourse(), 'uz', 'ru', () => 0.3);
  const gendered = lesson.filter(task => feminineForms[(task.studyEntry ?? task.entry).id]?.ru);
  assert.ok(gendered.length > 0);
  for (const task of gendered) assert.equal((task.studyEntry ?? task.entry).text.ru, feminineForms[(task.studyEntry ?? task.entry).id].ru);
  const dictation = lesson.find(task => task.task === 'dictation');
  assert.equal(dictation.entry.id, 'wellbeing-6');
  assert.ok(dictation.wordBank.expected.some(tile => tile.text === 'хотела'), 'word tiles use the feminine form');
  assert.equal(applySpeakerForms('m'), 'm');
  for (const entry of phrases) assert.equal(JSON.stringify([entry.text, entry.romanization]), before.get(entry.id), entry.id);
  assert.equal(applySpeakerForms(undefined), 'm');
});

test('the speaker form is saved with progress and validated', () => {
  assert.equal(validateState({ base: 'uz', target: 'ru', speaker: 'f', courses: {} }).speaker, 'f');
  assert.equal(validateState({ base: 'uz', target: 'ru', courses: {} }).speaker, undefined);
  assert.throws(() => validateState({ base: 'uz', target: 'ru', speaker: 'x', courses: {} }));
  for (const key of ['speakerForm', 'speakerFormLead', 'speakerMasculine', 'speakerFeminine', 'genderNote']) {
    for (const code of Object.keys(copy)) assert.ok(copy[code][key]?.trim(), code + ': ' + key);
  }
});
