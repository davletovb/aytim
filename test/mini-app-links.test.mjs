import test from 'node:test';
import assert from 'node:assert/strict';
import { miniAppRoute, resolveMiniAppRoute, takeMiniAppRoute } from '../dist/mini-app-links.mjs';
import { newCourse } from '../dist/engine.mjs';
import { path, checkpointPassMark } from '../dist/journey.mjs';
import { miniAppButton } from '../src/telegram-navigation.mjs';

test('Mini App routes use a strict allowlist and preserve Telegram launch data', () => {
  const env = { PUBLIC_APP_ORIGIN: 'https://aytim.test' };
  const link = miniAppButton(env, 'Read', 'story:blue-cup');
  const href = link.web_app.url + '&login=ok#tgWebAppData=signature&tgWebAppVersion=11';
  const saved = { aytimDepth: 2 };
  const calls = [];
  const history = { state: saved, replaceState: (...args) => calls.push(args) };
  assert.deepEqual(takeMiniAppRoute({ href }, history), { page: 'story', id: 'blue-cup' });
  assert.deepEqual(calls, [[saved, '', '/?login=ok#tgWebAppData=signature&tgWebAppVersion=11']]);
  assert.equal(takeMiniAppRoute({ href: 'https://aytim.test/?open=progress&open=lesson' }, history), null);
  for (const route of ['https://example.com', 'story:../blue-cup', 'settings', 'story:', 'study:hello', null]) {
    assert.equal(miniAppRoute(route), null);
    assert.equal(miniAppButton(env, 'Read', route), null);
  }
  assert.equal(miniAppButton({ PUBLIC_APP_ORIGIN: 'https://user@aytim.test/' }, 'Read', 'review'), null);
});

test('lesson and story links resolve against the active language pair and unlocks', () => {
  const course = newCourse();
  const state = { base: 'uz', target: 'ar', courses: { 'uz>ar': course } };
  const lesson = miniAppRoute('lesson');
  const firstLevel = path[0];
  assert.deepEqual(resolveMiniAppRoute(lesson, state), { page: 'study', id: firstLevel.units[0].id });
  course.best[firstLevel.units[0].id] = 100;
  assert.deepEqual(resolveMiniAppRoute(lesson, state), { page: 'study', id: firstLevel.units[1].id });
  for (const unit of firstLevel.units) course.best[unit.id] = 100;
  assert.deepEqual(resolveMiniAppRoute(lesson, state), { page: 'path' });
  course.practiceBest = { 'checkpoint-1': checkpointPassMark };
  assert.deepEqual(resolveMiniAppRoute(lesson, state), { page: 'study', id: path[1].units[0].id });
  const story = miniAppRoute('story:' + path[1].stories[0].id);
  assert.deepEqual(resolveMiniAppRoute(story, state), story);
  const otherPair = { ...state, target: 'tr' };
  assert.deepEqual(resolveMiniAppRoute(story, otherPair), { page: 'stories' });
  assert.deepEqual(resolveMiniAppRoute(miniAppRoute('story:unknown'), state), { page: 'stories' });
  assert.deepEqual(resolveMiniAppRoute(miniAppRoute('review'), state), { page: 'review' });
  assert.deepEqual(resolveMiniAppRoute(miniAppRoute('progress'), state), { page: 'progress' });
  assert.equal(resolveMiniAppRoute(lesson, { base: 'uz', target: 'uz' }), null);
  assert.equal(course.journey, undefined);
});
