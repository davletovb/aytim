import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, units, phrases } from '../dist/content.mjs';
import { wordGroups, words } from '../dist/words.mjs';
import { copy } from '../dist/copy.mjs';
import { newCourse, recordPractice, reviewQueue, saveReview } from '../dist/engine.mjs';
import { vocabularyEntries, vocabularyReviewSummary } from '../dist/vocabulary.mjs';
import { validateState } from '../dist/progress-data.mjs';

const wordCatalog = wordGroups.map(group => ({ ...group, entries: group.words }));
const phraseCatalog = units.map(unit => ({ ...unit, entries: unit.phrases }));
const options = { base: 'uz', target: 'en' };
const ids = rows => rows.map(row => row.entry.id).sort();

test('due and saved filters distinguish schedules from learning status without changing any saved data', () => {
  const course = newCourse();
  course.cards = {
    [words[0].id]: { step: 3, due: 1000 },
    [words[1].id]: { step: 0, due: 3000 },
    [phrases[0].id]: { step: -1, due: 1000 },
    [phrases[1].id]: { step: -1, due: 3000 },
    'retired-entry': { step: 0, due: 1 }
  };
  const before = structuredClone(course);
  const catalog = [...wordCatalog, ...phraseCatalog];
  const select = filter => vocabularyEntries(catalog, course, { ...options, filter }, 2000);
  assert.deepEqual(vocabularyReviewSummary(course, 2000), { ready: 2, saved: 4, state: 'due' });
  assert.deepEqual(ids(select('due')), [words[0].id, phrases[0].id].sort());
  assert.deepEqual(ids(select('saved')), [words[0].id, words[1].id, phrases[0].id, phrases[1].id].sort());
  assert.deepEqual(ids(select('queued')), [phrases[0].id, phrases[1].id].sort());
  assert.deepEqual(ids(select('practiced')), [words[1].id]);
  assert.deepEqual(ids(select('recalled')), [words[0].id]);
  assert.ok(select('new').every(row => !course.cards[row.entry.id]));
  assert.ok(select('due').every(row => row.due));
  assert.ok(!select('queued').find(row => row.entry.id === phrases[1].id).due);
  assert.deepEqual(course, before);
});

test('the merged review summary includes both entry types in all 30 directions, even while the catalog is filtered', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    const course = newCourse();
    recordPractice(course, [{ id: words[0].id, correct: false }, { id: phrases[0].id, correct: false }], 1000);
    const before = structuredClone(course);
    const select = (groups, extra = {}) => vocabularyEntries(groups, course, { base, target, ...extra }, 2000);
    assert.equal(select(wordCatalog, { filter: 'due' }).length, 1);
    assert.equal(select(phraseCatalog, { filter: 'due' }).length, 1);
    assert.deepEqual(vocabularyReviewSummary(course, 2000), { ready: 2, saved: 2, state: 'due' });
    for (const language of [base, target]) {
      assert.ok(select(wordCatalog, { query: words[0].text[language] }).some(row => row.entry === words[0]));
      assert.ok(select(phraseCatalog, { query: phrases[0].text[language] }).some(row => row.entry === phrases[0]));
    }
    if ([base, target].includes('ar')) {
      assert.ok(select(wordCatalog, { query: words[0].romanization }).some(row => row.entry === words[0]));
    }
    assert.equal(select(wordCatalog, { topic: wordCatalog[1].id, filter: 'due' }).length, 0);
    assert.equal(select(phraseCatalog, { query: 'no-such-entry-9851', filter: 'saved' }).length, 0);
    assert.deepEqual(course, before);
  }
});

test('reviewing from vocabulary retains delayed recall, retry timing, manual-practice protection and save compatibility', () => {
  const course = newCourse();
  const day = 86400000;
  assert.deepEqual(vocabularyReviewSummary(course, 1000), { ready: 0, saved: 0, state: 'empty' });
  recordPractice(course, [{ id: words[0].id, correct: false }, { id: phrases[0].id, correct: false }], 1000);
  assert.deepEqual(reviewQueue(course, false, 1000).map(entry => entry.id).sort(), [words[0].id, phrases[0].id].sort());
  saveReview(course, words[0].id, true, 1000);
  saveReview(course, phrases[0].id, false, 1000);
  assert.deepEqual(course.cards[words[0].id], { step: 0, due: 1000 + day });
  assert.deepEqual(course.cards[phrases[0].id], { step: -1, due: 601000 });
  assert.deepEqual(vocabularyReviewSummary(course, 2000), { ready: 0, saved: 2, state: 'caught-up' });
  const beforeManualPractice = structuredClone(course);
  saveReview(course, words[0].id, true, 2000);
  saveReview(course, phrases[0].id, true, 2000);
  assert.deepEqual(course, beforeManualPractice, 'Early practice must not accelerate the existing schedule');
  assert.equal(vocabularyReviewSummary(course, 601000).ready, 1);
  saveReview(course, phrases[0].id, true, 601000);
  assert.deepEqual(course.cards[phrases[0].id], { step: 0, due: 601000 + day });
  const profile = validateState(JSON.parse(JSON.stringify({ base: 'uz', target: 'en', courses: { 'uz>en': course, 'uz>tr': newCourse() } })));
  assert.deepEqual(profile.courses['uz>en'].cards, course.cards);
  assert.equal(vocabularyReviewSummary(profile.courses['uz>en'], 1000 + day).ready, 1);
  assert.deepEqual(vocabularyReviewSummary(profile.courses['uz>tr'], 1000 + day), { ready: 0, saved: 0, state: 'empty' });
});

test('merged vocabulary and review controls are translated in all six interface languages', () => {
  for (const code of codes) for (const key of ['vocabularyLead', 'vocabularyReviewTitle', 'vocabularyReviewDue',
    'vocabularyReviewCaughtUp', 'vocabularyReviewLater', 'vocabularyReviewEmpty', 'browseVocabulary',
    'backVocabulary', 'lexicon-due', 'lexicon-saved', 'practiceSeen', 'again']) {
    assert.ok(copy[code][key]?.trim(), code + ': ' + key);
    assert.doesNotMatch(copy[code][key], /undefined|TODO|\uFFFD/);
  }
});
