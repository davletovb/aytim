import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, phrases, units } from '../dist/content.mjs';
import { words, wordGroups } from '../dist/words.mjs';
import { stories, storyLines, storyPassed } from '../dist/stories.mjs';
import { moreLessons } from '../dist/more-lessons.mjs';
import { moreWordGroups } from '../dist/more-words.mjs';
import { moreStories } from '../dist/more-stories.mjs';
import { copy } from '../dist/copy.mjs';
import { homeRows } from '../dist/home-copy.mjs';
import { pageRows } from '../dist/pages-copy.mjs';
import { extraRows } from '../dist/expansion-copy.mjs';
import { cloudRows } from '../dist/cloud-copy.mjs';
import { authRows } from '../dist/auth-copy.mjs';
import { vocabularyRows } from '../dist/vocabulary-copy.mjs';
import { skillRows } from '../dist/skills-copy.mjs';
import { lessonRows } from '../dist/lesson-copy.mjs';
import { path, journeyFor, nextActivity, recordJourney } from '../dist/journey.mjs';
import { modes, checkpointQuestions, practiceQuestions, mixedQuestions, readingQuestions, matchRound, practiceSkill, normalizeSpelling, gapCandidates, practiceQuestion } from '../dist/practice.mjs';
import { defaultPair, lessonQuestions, newCourse, preferredPair, recordPractice, reviewQueue, searchText, validPair } from '../dist/engine.mjs';
import { launchLanguage } from '../dist/auth.mjs';
import { validateState } from '../dist/progress-data.mjs';
import { activitySummary, activityXp, recordActivity, xpPerActivity } from '../dist/home-progress.mjs';
import { pluralCategory, pluralText } from '../dist/plurals.mjs';
import { alphabets, letterExample, letterForms } from '../dist/alphabet.mjs';
import { languageNotes } from '../dist/language-notes.mjs';

function randomSource(seed = 7) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

function courseAt(level) {
  return { ...newCourse(), storyBest: {}, practiceBest: {}, journey: { level, evidence: {}, recent: {}, lastActivity: null } };
}

function translated(value) {
  assert.deepEqual(Object.keys(value).sort(), [...codes].sort());
  for (const code of codes) {
    assert.equal(typeof value[code], 'string');
    assert.ok(value[code].trim(), code + ': missing translation');
    assert.doesNotMatch(value[code], /undefined|\[object Object\]|TODO|TBD|\uFFFD/);
  }
}

function playable(question) {
  assert.ok(question.entry?.id);
  assert.ok(codes.includes(question.from));
  assert.ok(codes.includes(question.to));
  assert.ok(question.entry.text[question.to]?.trim());
  if (question.options) {
    assert.ok(question.options.length >= 3);
    assert.equal(question.options.filter(option => option.id === question.entry.id).length, 1);
    const answers = question.options.map(option => searchText(option.text[question.to]));
    assert.equal(new Set(answers).size, answers.length, 'Ambiguous options: ' + answers.join(' / '));
  }
  if (question.gap) {
    assert.equal(question.gap.before + question.entry.text[question.to] + question.gap.after, question.studyEntry.text[question.to]);
    assert.equal(normalizeSpelling(question.entry.text[question.to], question.to).length > 0, true);
  }
}

test('old memorize/hide/order exercise is absent from practice, mixed and level tests', () => {
  assert.equal(Object.hasOwn(modes, 'order'), false);
  const current = courseAt(4);
  assert.throws(() => practiceQuestions('order', current, 'uz', 'tr'), RangeError);
  for (const level of [1, 4, 8]) {
    const check = checkpointQuestions(level, 'uz', 'tr', randomSource(level));
    assert.ok(check.every(question => question.task !== 'order'));
  }
  assert.ok(mixedQuestions(current, 'uz', 'tr', randomSource(19)).every(question => question.task !== 'order'));
});

test('all eight levels include the expansion exactly once', () => {
  assert.equal(path.length, 8);
  assert.equal(units.length, 64);
  assert.equal(phrases.length, 384);
  assert.equal(words.length, 486);
  assert.equal(stories.length, 31);
  for (const step of path) {
    assert.equal(step.units.length, 8);
    assert.equal(step.units.filter(unit => moreLessons.includes(unit)).length, 2);
    assert.equal(step.wordGroups.filter(group => moreWordGroups.includes(group)).flatMap(group => group.words).length, 16);
    assert.equal(step.stories.filter(story => moreStories.includes(story)).length, 1);
    assert.ok(step.support.includes('reading:' + moreStories.find(story => story.level === step.level).id));
  }
  for (const [all, assigned] of [[units, path.flatMap(s => s.units)], [wordGroups, path.flatMap(s => s.wordGroups)], [stories, path.flatMap(s => s.stories)]]) {
    assert.deepEqual(new Set(assigned.map(item => item.id)), new Set(all.map(item => item.id)));
    assert.equal(assigned.length, all.length);
  }
  const ids = [...phrases, ...words, ...storyLines].map(entry => entry.id);
  assert.equal(new Set(ids).size, ids.length, 'Catalog IDs must not collide with existing saves');
});

test('all material has six translations, Arabic reading aids, and distinct vocabulary', () => {
  for (const item of [...units, ...wordGroups, ...stories]) {
    translated(item.title);
    if (item.description) translated(item.description);
    for (const entry of item.phrases ?? item.words ?? item.lines) {
      translated(entry.text);
      assert.ok(entry.romanization?.trim(), entry.id + ': missing Arabic reading aid');
      assert.match(entry.text.ar, /\p{Script=Arabic}/u);
    }
  }
  const existing = new Set(words.filter(word => !moreWordGroups.some(group => group.words.includes(word))).map(word => word.text.en));
  const additions = moreWordGroups.flatMap(group => group.words).map(word => word.text.en);
  assert.equal(new Set(additions).size, 128);
  assert.ok(additions.every(word => !existing.has(word)), 'Expansion must add new vocabulary');
  for (const story of moreStories) {
    assert.equal(story.questions.length, 4);
    assert.ok(story.lines.length >= 6);
    for (const { prompt, choices } of story.questions) {
      translated(prompt);
      assert.equal(choices.length, 3);
      choices.forEach(translated);
    }
  }
  for (const code of codes) for (const key of ['levelTest', 'levelTestLead', 'levelTestDone', 'levelTestPassed', 'levelTestRetry']) {
    assert.ok(copy[code][key]?.trim(), code + ': ' + key);
  }
});

test('level tests, new lessons, stories and adaptive activities work in all 30 directions at all levels', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const step of path) {
      const random = randomSource(13 * step.level);
      const questions = checkpointQuestions(step.level, base, target, random);
      assert.equal(questions.length, 12);
      questions.forEach(playable);
      const entries = questions.map(question => question.studyEntry ?? question.entry);
      assert.equal(new Set(entries.map(entry => entry.id)).size, 12);
      assert.ok(step.units.every(unit => entries.some(entry => unit.phrases.includes(entry))), 'Every lesson must be sampled');
      assert.equal(entries.filter(entry => words.includes(entry)).length, 4);
      assert.ok(entries.every(entry => step.phrases.includes(entry) || step.wordGroups.some(group => group.words.includes(entry))));
      assert.ok(questions.some(question => question.task === 'gap'));
      assert.ok(questions.every(question => question.task !== 'spelling'));
      const course = courseAt(step.level);
      for (const mode of ['translation', 'words', 'gap', 'listen']) {
        const practice = practiceQuestions(mode, course, base, target, random);
        assert.equal(practice.length, 6);
        practice.forEach(playable);
      }
      mixedQuestions(course, base, target, random).forEach(playable);
      const round = matchRound(course, random);
      assert.equal(round.baseCards.length, 5);
      assert.deepEqual(new Set(round.baseCards), new Set(round.targetCards));
    }
    for (const unit of moreLessons) lessonQuestions(unit, base, target, randomSource()).forEach(playable);
    for (const story of moreStories) readingQuestions(story, base, randomSource()).forEach(playable);
  }
  assert.notDeepEqual(checkpointQuestions(8, 'uz', 'tr', randomSource(1)), checkpointQuestions(8, 'uz', 'tr', randomSource(2)));
  for (const level of [0, 9, 1.5, '2', NaN]) assert.throws(() => checkpointQuestions(level, 'uz', 'tr'), RangeError);
});

test('four-question stories require three correct answers, without bypassing mandatory checkpoints', () => {
  const oldStory = stories.find(story => !moreStories.includes(story));
  assert.equal(storyPassed(oldStory, 2), true);
  for (const story of moreStories) {
    assert.equal(storyPassed(story, 2), false);
    assert.equal(storyPassed(story, 3), true);
    assert.equal(storyPassed(story), false);
    const course = courseAt(story.level);
    for (const unit of path[story.level - 1].units) course.best[unit.id] = 100;
    for (const earlier of path[story.level - 1].stories) course.storyBest[earlier.id] = earlier.questions.length;
    course.storyBest[story.id] = 2;
    assert.equal(storyPassed(story, course.storyBest[story.id]), false);
    // All lessons are done: the level test takes priority over optional reading.
    assert.equal(nextActivity(course).type, 'checkpoint');
    course.storyBest[story.id] = 3;
    assert.equal(storyPassed(story, course.storyBest[story.id]), true);
    assert.equal(nextActivity(course).type, 'checkpoint');
    const legacy = { ...newCourse(), storyBest: { [story.id]: 2 } };
    assert.equal(journeyFor(legacy).evidence['reading:' + story.id], undefined);
  }
});

test('new test scores and failed questions survive validation and enter spaced repetition', () => {
  const course = courseAt(8);
  const questions = checkpointQuestions(8, 'uz', 'tr', randomSource());
  const answers = questions.map((question, index) => ({
    id: (question.studyEntry ?? question.entry).id, correct: index >= 3, skill: practiceSkill(question.task)
  }));
  recordJourney(course, answers, 'checkpoint', 1000);
  assert.equal(recordPractice(course, answers, 1000), 9);
  course.practiceBest['checkpoint-8'] = 9;
  const restored = validateState(JSON.parse(JSON.stringify({ base: 'uz', target: 'tr', courses: { 'uz>tr': course } }))).courses['uz>tr'];
  assert.equal(restored.practiceBest['checkpoint-8'], 9);
  assert.equal(restored.journey.lastActivity, 'checkpoint');
  assert.deepEqual(new Set(reviewQueue(restored, false, 1001).map(entry => entry.id)), new Set(answers.slice(0, 3).map(answer => answer.id)));
  for (const entry of [...moreLessons.flatMap(unit => unit.phrases), ...moreWordGroups.flatMap(group => group.words)]) {
    const sample = courseAt(8);
    recordPractice(sample, [{ id: entry.id, correct: false }], 1000);
    assert.equal(reviewQueue(sample, false, 1001)[0].id, entry.id);
  }
});

test('vocabulary is taught no later than the lessons that rely on it, without duplicate answers', () => {
  // A word that lessons use from Level N must be browsable in Lug‘at by Level N + 2 at the latest.
  const tokens = text => new Set([...text.toLowerCase().matchAll(/[a-z’']+/g)].map(match => match[0]));
  for (const word of words) {
    const english = word.text.en.toLowerCase();
    if (english.includes(' ')) continue;
    const used = units.filter(unit => unit.phrases.some(entry => tokens(entry.text.en).has(english))).map(unit => unit.level);
    if (used.length) assert.ok(word.level <= Math.min(...used) + 2, english + ' is taught too late');
  }
  for (const level of path.map(step => step.level)) {
    const entries = words.filter(word => word.level === level);
    for (const code of codes) {
      const answers = entries.map(word => searchText(word.text[code]));
      assert.equal(new Set(answers).size, answers.length, 'Level ' + level + ' repeats a ' + code + ' answer');
    }
  }
  for (const code of codes) {
    const texts = phrases.map(entry => searchText(entry.text[code]));
    assert.equal(new Set(texts).size, texts.length, 'Duplicate ' + code + ' lesson phrase');
  }
});

test('a gap leaves context and the answer is not singled out by its capitalisation', () => {
  const capital = word => /^\p{Lu}/u.test(word);
  for (const target of codes) {
    const base = codes.find(code => code !== target);
    for (const unit of units) for (const entry of gapCandidates(unit.phrases, target)) {
      for (let seed = 1; seed <= 4; seed++) {
        const question = practiceQuestion('gap', entry, 0, base, target, randomSource(seed));
        const context = question.gap.before + question.gap.after;
        assert.match(context, /\p{L}/u, 'Gapped away the whole phrase: ' + entry.text[target]);
        const answer = question.entry.text[target];
        const others = question.options.filter(option => option !== question.entry).map(option => option.text[target]);
        assert.ok(others.some(option => capital(option) === capital(answer)),
          'Only the answer is ' + (capital(answer) ? 'capitalised' : 'lower case') + ': ' + [answer, ...others].join(' / '));
      }
    }
  }
});

test('a first visit opens in the visitor\u2019s own language', () => {
  assert.deepEqual(preferredPair(['ru-RU', 'en-US']), { base: 'ru', target: 'en' });
  assert.deepEqual(preferredPair(['en-GB']), { base: 'en', target: 'uz' });
  assert.deepEqual(preferredPair(['de']), { base: 'de', target: 'en' });
  assert.deepEqual(preferredPair(['uz-Latn-UZ']), { base: 'uz', target: 'en' });
  assert.deepEqual(preferredPair(['fr', 'tr']), { base: 'tr', target: 'en' }, 'the first language Aytim has wins');
  for (const unsupported of [undefined, [], ['fr-FR'], [null, '', undefined], 'ja']) {
    assert.deepEqual(preferredPair(unsupported), defaultPair);
  }
  for (const code of codes) {
    const pair = preferredPair([code]);
    assert.ok(validPair(pair.base, pair.target));
    assert.equal(pair.base, code);
  }
  const launch = 'query_id=A&user=' + encodeURIComponent(JSON.stringify({ id: 7, first_name: 'A', language_code: 'tr' })) + '&hash=ab';
  assert.equal(launchLanguage(launch), 'tr');
  assert.deepEqual(preferredPair([launchLanguage(launch)]), { base: 'tr', target: 'en' });
  for (const broken of ['', 'user=%7B', 'user=null', 'nothing=1']) assert.equal(launchLanguage(broken), '');
});

test('counted labels agree with the number in every language', () => {
  const counted = ['questionsLabel', 'pairsLabel', 'cardsReviewed', 'skillPracticeCount'];
  for (const code of codes) for (const key of counted) {
    const forms = copy[code][key];
    assert.ok(forms, code + ': ' + key);
    if (typeof forms === 'string') {
      assert.match(forms, /\{n\}/, code + ' ' + key + ' never shows the number');
    } else {
      for (const category of new Intl.PluralRules(code).resolvedOptions().pluralCategories) {
        assert.ok(forms[category]?.trim(), code + ' ' + key + ' has no "' + category + '" form');
      }
      assert.ok(forms.other?.trim(), code + ' ' + key + ' has no fallback form');
    }
    for (const count of [0, 1, 2, 3, 5, 6, 8, 11, 12, 21, 101]) {
      const text = pluralText(code, forms, count).replace('{n}', String(count));
      assert.ok(text.trim(), code + ' ' + key + ' ' + count);
      assert.doesNotMatch(text, /\{n\}|undefined|\[object Object\]/);
      assert.equal(typeof pluralCategory(code, count), 'string');
    }
  }
  assert.equal(pluralText('en', 'plain {n}', 2), 'plain {n}');
  assert.equal(pluralText('en', undefined, 2), '');
});

test('every copy row carries one entry per language', () => {
  const tables = { homeRows, pageRows, extraRows, cloudRows, authRows, vocabularyRows, skillRows, lessonRows };
  const seen = new Set();
  for (const [name, rows] of Object.entries(tables)) {
    rows.forEach((row, index) => {
      // A row missing its trailing comma turns the next one into a property
      // access, which leaves a hole here rather than failing at the source.
      assert.ok(Array.isArray(row), name + '[' + index + '] is not a row; check for a missing comma');
      assert.equal(row.length, codes.length + 1, name + ': ' + row[0] + ' has ' + (row.length - 1) + ' of ' + codes.length + ' languages');
      assert.equal(typeof row[0], 'string');
      for (const value of row.slice(1)) {
        assert.ok(typeof value === 'string' ? value.trim() : value && typeof value === 'object',
          name + ': ' + row[0] + ' has an empty translation');
      }
      assert.ok(!seen.has(row[0]), 'duplicate copy key ' + row[0]);
      seen.add(row[0]);
    });
  }
});

test('the alphabet primer covers both scripts, with an example for every letter', () => {
  assert.equal(alphabets.ar.length, 28);
  assert.equal(alphabets.ru.length, 33);
  for (const code of codes) {
    assert.equal(Object.hasOwn(alphabets, code), ['ar', 'ru'].includes(code), code);
  }
  for (const [code, letters] of Object.entries(alphabets)) {
    assert.equal(new Set(letters.map(letter => letter.letter)).size, letters.length, code + ' repeats a letter');
    for (const letter of letters) {
      assert.ok(letter.roman.trim(), code + ' ' + letter.letter + ' has no reading aid');
      assert.ok(letter.forms.length >= 2, code + ' ' + letter.letter + ' has too few forms');
      assert.ok(letter.forms.every(form => form.toLowerCase().includes(letter.letter.toLowerCase())),
        code + ' ' + letter.letter + ': a form does not contain the letter');
      const example = letterExample(letter.letter, words, code);
      assert.ok(example, code + ': no example word for ' + letter.letter);
      assert.match(example.text[code].toLowerCase(), new RegExp(letter.letter.toLowerCase()));
    }
  }
  // The six Arabic letters that never join to the next one have no initial or medial form.
  assert.deepEqual(letterForms('د'), ['د', 'ـد']);
  assert.deepEqual(letterForms('ب'), ['ب', 'بـ', 'ـبـ', 'ـب']);
  // A letter that cannot begin a word still finds an example inside one.
  assert.ok(letterExample('Ъ', words, 'ru').text.ru.includes('ъ'));
  assert.equal(letterExample('ב', words, 'he'), null);
});

test('every language Aytim teaches has notes, readable in all six interfaces', () => {
  assert.deepEqual(Object.keys(languageNotes).sort(), [...codes].sort());
  const seen = new Set();
  for (const code of codes) {
    const notes = languageNotes[code];
    assert.ok(notes.length >= 4, code + ' has only ' + notes.length + ' notes');
    for (const note of notes) {
      translated(note);
      for (const reader of codes) {
        assert.ok(note[reader].length > 20, code + ' note is too short in ' + reader);
        assert.match(note[reader], /[.!?]$/, code + ' note in ' + reader + ' is not a sentence');
      }
      const key = code + '|' + note.en;
      assert.ok(!seen.has(key), 'duplicate note: ' + note.en);
      seen.add(key);
    }
  }
  // A note explains the language being learned, so it is never shown to its own speakers.
  assert.ok(languageNotes.de.some(note => /\bdu\b/.test(note.en)), 'German notes should cover du and Sie');
  assert.ok(languageNotes.ru.some(note => note.en.includes('ты')), 'Russian notes should cover ты and вы');
});

test('XP follows how an activity went, and old saves keep their total', () => {
  const now = Date.parse('2026-11-12T10:00:00Z');
  const course = {};
  recordActivity(course, { seconds: 60, correct: 8 }, now);
  recordActivity(course, { seconds: 60, correct: 3 }, now);
  recordActivity(course, { seconds: 60 }, now);
  const earned = activitySummary(course, now);
  assert.equal(earned.xp, activityXp(8) + activityXp(3) + activityXp(0));
  assert.ok(activityXp(8) > activityXp(3), 'answering well must be worth more than scraping through');
  assert.equal(activityXp(0), xpPerActivity, 'finishing an activity still earns the flat amount');
  assert.equal(activityXp(-5), xpPerActivity);
  assert.equal(earned.today.sessions, 3);

  // A day saved before XP was recorded is still counted at the old flat rate.
  const legacy = { activityDays: { '2026-11-10': { seconds: 300, sessions: 4, lessons: [], recalled: [] } } };
  assert.equal(activitySummary(legacy, now).xp, 4 * xpPerActivity);
  recordActivity(legacy, { seconds: 30, correct: 2 }, Date.parse('2026-11-10T09:00:00Z'));
  assert.equal(activitySummary(legacy, now).xp, 4 * xpPerActivity + activityXp(2), 'the old days are not recounted');

  // The saved shape survives validation in both forms.
  const saved = days => ({ base: 'uz', target: 'en', courses: { 'uz>en': { best: {}, cards: {}, ...days } } });
  for (const state of [saved(course), saved(legacy)]) {
    assert.deepEqual(validateState(state).courses['uz>en'].activityDays, state.courses['uz>en'].activityDays);
  }
});

test('story answers cannot be guessed from option length', () => {
  // The right answer should not usually be the longest (or always the middle) option.
  const rank = (choices, code) => {
    const [answer, ...others] = choices.map(choice => choice[code].length);
    return others.every(length => answer > length) ? 'longest' : others.every(length => answer < length) ? 'shortest' : 'middle';
  };
  const questions = stories.flatMap(story => story.questions.map(question => ({ ...question, level: story.level })));
  // Every language and level is checked before failing, so one problem cannot hide another.
  const problems = [];
  for (const code of codes) {
    for (const position of ['longest', 'middle', 'shortest']) {
      const share = questions.filter(question => rank(question.choices, code) === position).length / questions.length;
      if (share > 0.55) problems.push(code + ': the ' + position + ' option is right in ' + Math.round(share * 100) + '% of questions');
    }
    for (const step of path) {
      const level = questions.filter(question => question.level === step.level);
      if (level.length < 10) continue;
      const longest = level.filter(question => rank(question.choices, code) === 'longest').length;
      if (longest / level.length > 0.6) problems.push(code + ' Level ' + step.level + ': longest option right in ' + longest + '/' + level.length);
    }
  }
  assert.deepEqual(problems, []);
});

test('Arabic story text uses the Arabic question mark', () => {
  for (const story of stories) {
    for (const item of [story.title, story.description, ...story.lines.map(line => line.text), ...story.questions.flatMap(question => [question.prompt, ...question.choices])]) {
      assert.ok(!item.ar.includes('?'), story.id + ': ' + item.ar);
    }
    for (const question of story.questions) assert.match(question.prompt.ar, /؟$/, story.id + ': ' + question.prompt.ar);
  }
});
