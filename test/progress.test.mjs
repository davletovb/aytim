import assert from 'node:assert/strict';
import { after, afterEach, before, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { CloudSync } from '../dist/cloud-sync.mjs';
import { maxSaveBytes, validateState } from '../dist/progress-data.mjs';
import { saveLesson } from '../dist/engine.mjs';
import { recordActivity } from '../dist/home-progress.mjs';
import { journeyFor } from '../dist/journey.mjs';
import { units } from '../dist/content.mjs';
import { workerOptions as options, migrate } from './worker-helper.mjs';

let mf;
const clients = [];
before(async () => {
  mf = new Miniflare(convertV4MiniflareOptions(options));
  await migrate(mf);
});
afterEach(() => { for (const client of clients.splice(0)) client.stop(); });
after(async () => { await mf?.dispose(); });


function save(score = 5) {
  const course = { best: {}, cards: {} };
  const unit = units[0];
  const answers = unit.phrases.map((entry, index) => ({ id: entry.id, correct: index < score }));
  saveLesson(course, unit, answers, 1794096000000);
  recordActivity(course, { seconds: 90, lessonId: unit.id }, 1794096000000);
  journeyFor(course);
  return { base: 'uz', target: 'en', transliterate: true, courses: { 'uz>en': course } };
}

function browser(instance = () => mf) {
  return {
    cookie: '', offline: false,
    async fetch(path, options = {}) {
      if (this.offline) throw new TypeError('Offline');
      const response = await instance().dispatchFetch('https://aytim.test' + path, {
        ...options,
        headers: { 'X-Aytim-Client': '1', Origin: 'https://aytim.test', ...(this.cookie ? { Cookie: this.cookie } : {}), ...options.headers }
      });
      const cookie = response.headers.get('Set-Cookie');
      if (cookie) this.cookie = cookie.split(';')[0];
      return response;
    },
    async get() { return (await this.fetch('/api/progress')).json(); },
    async put(profile, state, revision = profile.revision) {
      return this.fetch('/api/progress', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.profileId, revision, state })
      });
    },

  };
}

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

function client(actor, initial = save(), { storage = memoryStorage(), hasLocal = true, canApply, fetcher } = {}) {
  const local = { state: structuredClone(initial) };
  const sync = new CloudSync({ storage, getState: () => local.state, applyState: state => { local.state = state; },
    hasLocal, canApply, fetcher: fetcher ?? actor.fetch.bind(actor) });
  clients.push(sync);
  return { sync, local, storage };
}

test('D1 round-trip preserves real lesson, review, activity, XP and journey data; learners are isolated', async () => {
  const actor = browser();
  const response = await actor.fetch('/api/progress');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(response.headers.get('Set-Cookie'), /__Host-aytim_session=.+HttpOnly; SameSite=Lax; Path=\/; Max-Age=\d+; Secure/);
  const profile = await response.json();
  assert.equal(profile.state, null);
  assert.equal((await actor.get()).profileId, profile.profileId);
  assert.equal((await actor.put(profile, save())).status, 200);
  const restored = await actor.get();
  assert.deepEqual(restored.state, validateState(save()));
  assert.equal(restored.revision, 1);
  assert.equal((await browser().get()).state, null);
  const db = await mf.getD1Database('DB');
  const tokens = (await db.prepare('SELECT token_hash FROM learner_sessions WHERE learner_id = ?').bind(profile.profileId).all()).results;
  assert.notEqual(tokens[0].token_hash, actor.cookie.split('=')[1]);
});

test('concurrent saves use a database compare-and-swap and return the winning copy', async () => {
  const actor = browser();
  const profile = await actor.get();
  const results = await Promise.all([actor.put(profile, save(2)), actor.put(profile, save(5))]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  const conflict = await results.find(result => result.status === 409).json();
  assert.deepEqual(conflict.state, (await actor.get()).state);
  assert.equal(conflict.revision, 1);
});

test('recovery-code endpoints are retired in favor of Telegram sign-in', async () => {
  const actor = browser();
  await actor.get();
  for (const path of ['/api/recovery-code', '/api/restore']) {
    assert.equal((await actor.fetch(path, { method: 'POST' })).status, 410);
  }
});

test('API rejects invalid saves, oversized bodies, stale sessions and cross-origin requests', async () => {
  const actor = browser();
  const profile = await actor.get();
  await actor.put(profile, save());
  const current = await actor.get();
  for (const invalid of [null, [], { ...save(), base: 'xx' }, { ...save(), courses: [] },
    { ...save(), courses: JSON.parse('{"__proto__":{}}') },
    { ...save(), courses: { 'uz>en': { best: {}, cards: { x: { step: 99, due: 1 } } } } }]) {
    assert.equal((await actor.put(current, invalid)).status, 400);
  }
  assert.equal((await actor.get()).revision, current.revision);
  assert.equal((await actor.fetch('/api/progress', { method: 'PUT', body: '{}' })).status, 415);
  assert.equal((await actor.fetch('/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await actor.fetch('/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(maxSaveBytes + 1) })).status, 413);
  assert.equal((await browser().put(current, save())).status, 401);
  assert.equal((await actor.fetch('/api/progress', { headers: { Origin: 'https://other.test' } })).status, 403);
  assert.equal((await actor.fetch('/api/progress', { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
  assert.equal((await mf.dispatchFetch('https://aytim.test/api/progress')).status, 403);
  assert.equal((await actor.fetch('/api/progress', { method: 'DELETE' })).status, 405);
  assert.equal((await actor.fetch('/api/no-such-route')).status, 404);
  assert.equal((await mf.dispatchFetch('https://aytim.test/')).status, 200);
  const db = await mf.getD1Database('DB');
  await db.prepare('UPDATE learner_sessions SET expires_at = 0 WHERE learner_id = ?').bind(current.profileId).run();
  assert.equal((await actor.put(current, save())).status, 401);
});

test('browser automatically migrates existing local progress and resumes offline edits after a reload', async () => {
  const actor = browser();
  const first = client(actor);
  await first.sync.connect();
  await first.sync.flush();
  assert.equal(first.sync.status, 'saved');
  actor.offline = true;
  first.local.state = save(2);
  first.sync.queue();
  await first.sync.flush();
  assert.equal(first.sync.status, 'offline');
  first.sync.stop();
  actor.offline = false;
  const reloaded = client(actor, first.local.state, { storage: first.storage });
  await reloaded.sync.connect();
  await reloaded.sync.flush();
  assert.equal(reloaded.sync.status, 'saved');
  assert.deepEqual((await actor.get()).state, validateState(save(2)));
});

test('the default browser fetch uses the global receiver required by native browser APIs', async () => {
  const actor = browser();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  // Node fetch accepts arbitrary receivers. Browser fetch rejects non-Window receivers.
  globalThis.fetch = function (...args) {
    if (this !== globalThis) throw new TypeError('Illegal invocation');
    calls++;
    return actor.fetch(...args);
  };
  const sync = new CloudSync({ storage: memoryStorage(), getState: () => save(), applyState: () => {} });
  try {
    await sync.connect();
    await sync.flush();
    assert.equal(sync.status, 'saved');
    assert.equal(calls, 2);
  } finally {
    sync.stop();
    globalThis.fetch = originalFetch;
  }
});

test('a clean browser adopts newer cloud data, while offline divergence requires an explicit choice', async () => {
  const actor = browser();
  const first = client(actor);
  await first.sync.connect(); await first.sync.flush();
  await actor.put(await actor.get(), save(5));
  await first.sync.connect();
  assert.deepEqual(first.local.state, validateState(save(5)));
  first.local.state = save(2); first.sync.queue();
  await actor.put(await actor.get(), save(3));
  await first.sync.connect();
  assert.equal(first.sync.status, 'conflict');
  assert.deepEqual(first.local.state, save(2));
  first.sync.useCloud();
  assert.deepEqual(first.local.state, validateState(save(3)));
  first.local.state = save(1); first.sync.queue();
  await actor.put(await actor.get(), save(4));
  await first.sync.flush();
  assert.equal(first.sync.status, 'conflict');
  // A third write after displaying a conflict must still be protected.
  await actor.put(await actor.get(), save(5));
  await first.sync.useLocal();
  assert.equal(first.sync.status, 'conflict');
  await first.sync.useLocal();
  assert.equal(first.sync.status, 'saved');
  assert.deepEqual((await actor.get()).state, validateState(save(1)));
});

test('edits made during an in-flight save are queued and are not marked as already backed up', async () => {
  const actor = browser();
  let release;
  let intercept = false;
  let entered;
  const saving = new Promise(resolve => { entered = resolve; });
  const first = client(actor, save(), { fetcher: async (path, options) => {
    if (intercept && options.method === 'PUT') {
      intercept = false;
      entered();
      await new Promise(resolve => { release = resolve; });
    }
    return actor.fetch(path, options);
  } });
  await first.sync.connect(); await first.sync.flush();
  intercept = true;
  first.local.state = save(2); first.sync.queue();
  const pending = first.sync.flush();
  await saving;
  first.local.state = save(5); first.sync.queue();
  release(); await pending;
  assert.equal(first.sync.dirty, true);
  await first.sync.flush();
  assert.equal(first.sync.status, 'saved');
  assert.deepEqual((await actor.get()).state, validateState(save(5)));
});

test('cloud refresh cannot replace an active exercise; static-only hosting keeps local data', async () => {
  const actor = browser();
  await actor.put(await actor.get(), save(5));
  const active = client(actor, save(1), { hasLocal: false, canApply: () => false });
  await active.sync.connect();
  assert.equal(active.sync.status, 'conflict');
  assert.deepEqual(active.local.state, save(1));
  const staticOnly = client(actor, save(2), { fetcher: async () => new Response('<html>Static site</html>', { headers: { 'Content-Type': 'text/html' } }) });
  await staticOnly.sync.connect();
  assert.equal(staticOnly.sync.status, 'unavailable');
  assert.deepEqual(staticOnly.local.state, save(2));
});

test('an acknowledged save with a lost response is recognized on retry without an unnecessary conflict', async () => {
  const actor = browser();
  let loseResponse = false;
  const first = client(actor, save(), { fetcher: async (path, options) => {
    const response = await actor.fetch(path, options);
    if (loseResponse && options.method === 'PUT') { loseResponse = false; throw new TypeError('Lost response'); }
    return response;
  } });
  await first.sync.connect(); await first.sync.flush();
  first.local.state = save(2); first.sync.queue(); loseResponse = true;
  await first.sync.flush();
  assert.equal(first.sync.status, 'offline');
  await first.sync.flush();
  assert.equal(first.sync.status, 'saved');
  assert.equal(first.sync.conflict, null);
});

test('D1 progress survives a Worker runtime restart', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'aytim-d1-'));
  let instance = new Miniflare({ ...convertV4MiniflareOptions(options), resourcePersistencePath: directory });
  const actor = browser(() => instance);
  try {
    await migrate(instance);
    const profile = await actor.get();
    await actor.put(profile, save(5));
    await instance.dispose();
    instance = new Miniflare({ ...convertV4MiniflareOptions(options), resourcePersistencePath: directory });
    assert.deepEqual((await actor.get()).state, validateState(save(5)));
  } finally {
    await instance.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});
