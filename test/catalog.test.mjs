import test from 'node:test';
import assert from 'node:assert/strict';
import { codes, phrases, units } from '../dist/content.mjs';
import { words, wordGroups } from '../dist/words.mjs';
import { stories, storyLines, storyPassed } from '../dist/stories.mjs';
import { moreLessons } from '../dist/more-lessons.mjs';
import { moreWordGroups } from '../dist/more-words.mjs';
import { moreStories } from '../dist/more-stories.mjs';
import { copy } from '../dist/copy.mjs';
import { path, journeyFor, nextActivity, recordJourney } from '../dist/journey.mjs';
import { modes, checkpointQuestions, practiceQuestions, mixedQuestions, readingQuestions, matchRound, practiceSkill, normalizeSpelling, gapCandidates, practiceQuestion } from '../dist/practice.mjs';
import { lessonQuestions, newCourse, recordPractice, reviewQueue, searchText } from '../dist/engine.mjs';
import { validateState } from '../dist/progress-data.mjs';

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
  assert.equal(units.length, 56);
  assert.equal(phrases.length, 336);
  assert.equal(words.length, 359);
  assert.equal(stories.length, 26);
  for (const step of path) {
    assert.equal(step.units.length, 7);
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

test('new material has all six translations, Arabic reading aids, and distinct vocabulary', () => {
  for (const item of [...moreLessons, ...moreWordGroups, ...moreStories]) {
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

test('story answers cannot be guessed from option length', () => {
  // The right answer should not usually be the longest (or always the middle) option.
  const rank = (choices, code) => {
    const [answer, ...others] = choices.map(choice => choice[code].length);
    return others.every(length => answer > length) ? 'longest' : others.every(length => answer < length) ? 'shortest' : 'middle';
  };
  const questions = stories.flatMap(story => story.questions.map(question => ({ ...question, level: story.level })));
  for (const code of codes) {
    for (const position of ['longest', 'middle', 'shortest']) {
      const share = questions.filter(question => rank(question.choices, code) === position).length / questions.length;
      assert.ok(share <= 0.55, code + ': the ' + position + ' option is right in ' + Math.round(share * 100) + '% of questions');
    }
    for (const step of path) {
      const level = questions.filter(question => question.level === step.level);
      if (level.length < 10) continue;
      const longest = level.filter(question => rank(question.choices, code) === 'longest').length;
      assert.ok(longest / level.length <= 0.6, code + ' Level ' + step.level + ': longest option right in ' + longest + '/' + level.length);
    }
  }
});
