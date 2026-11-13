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

// One more lesson on top of a copy, as another device would practise it.
function practise(state, unit, score = 6) {
  const copy = structuredClone(state);
  const course = copy.courses['uz>en'] ??= { best: {}, cards: {} };
  saveLesson(course, unit, unit.phrases.map((entry, index) => ({ id: entry.id, correct: index < score })), 1794096000000);
  recordActivity(course, { seconds: 60, lessonId: unit.id }, 1794096000000);
  return validateState(copy);
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

test('anonymous learners no browser can still reach are swept away', async () => {
  const db = await mf.getD1Database('DB');
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const rows = {
    unreachable: { updated: now - 40 * day, expires: now - 10 * day, account: false },
    stillSignedIn: { updated: now - 40 * day, expires: now + 10 * day, account: false },
    claimed: { updated: now - 40 * day, expires: now - 10 * day, account: true },
    justMade: { updated: now - day, expires: now - 1000, account: false }
  };
  for (const [name, row] of Object.entries(rows)) {
    await db.prepare('INSERT INTO learners (id, created_at, updated_at) VALUES (?, ?, ?)')
      .bind(name, row.updated, row.updated).run();
    await db.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at, authenticated) VALUES (?, ?, ?, ?)')
      .bind('hash-' + name, name, row.expires, row.account ? 1 : 0).run();
    if (row.account) {
      await db.prepare(`INSERT INTO telegram_accounts (telegram_id, learner_id, display_name, created_at, last_login_at)
        VALUES (?, ?, ?, ?, ?)`).bind('900' + name.length, name, 'Kept', row.updated, row.updated).run();
    }
  }
  const present = async () => {
    const found = await db.prepare('SELECT id FROM learners WHERE id IN (?, ?, ?, ?)')
      .bind(...Object.keys(rows)).all();
    return new Set(found.results.map(entry => entry.id));
  };
  assert.equal((await present()).size, 4);

  // A new anonymous visitor is what triggers the sweep.
  await browser().fetch('/api/progress');
  const left = await present();
  assert.equal(left.has('unreachable'), false, 'an expired anonymous learner should be gone');
  assert.equal(left.has('stillSignedIn'), true, 'a live session must keep its learner');
  assert.equal(left.has('claimed'), true, 'a learner with a Telegram account is never swept');
  assert.equal(left.has('justMade'), true, 'the grace period protects a row made days ago');

  // Its sessions go with it, and the visitor that triggered the sweep still works.
  const orphans = await db.prepare('SELECT COUNT(*) AS total FROM learner_sessions WHERE learner_id = ?')
    .bind('unreachable').first();
  assert.equal(orphans.total, 0);
  const visitor = browser();
  const profile = await (await visitor.fetch('/api/progress')).json();
  assert.equal((await visitor.put(profile, save())).status, 200);
});

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

test('a clean browser adopts newer cloud data; practice saved offline is merged with another device’s', async () => {
  const actor = browser();
  const first = client(actor);
  await first.sync.connect(); await first.sync.flush();
  await actor.put(await actor.get(), save(5));
  await first.sync.connect();
  assert.deepEqual(first.local.state, validateState(save(5)));
  actor.offline = true;
  first.local.state = practise(first.local.state, units[1]); first.sync.queue();
  await first.sync.flush();
  assert.equal(first.sync.status, 'offline');
  actor.offline = false;
  // Meanwhile another device saved a different lesson.
  const cloud = await actor.get();
  await actor.put(cloud, practise(cloud.state, units[2]));
  await first.sync.flush(); await first.sync.flush();
  assert.equal(first.sync.status, 'saved');
  const saved = (await actor.get()).state;
  assert.deepEqual(first.local.state, saved);
  for (const unit of [units[0], units[1], units[2]]) assert.ok(saved.courses['uz>en'].best[unit.id] > 0, unit.id);
  assert.equal(Object.values(saved.courses['uz>en'].activityDays)[0].sessions, 3);
});

test('two devices that practise in turn end up with the same progress, without asking', async () => {
  const actor = browser();
  const desktop = client(actor, save(5));
  await desktop.sync.connect(); await desktop.sync.flush();
  // A device with nothing saved yet takes the account's progress as it is.
  const phone = client(actor, { base: 'uz', target: 'en', transliterate: true, courses: {} }, { hasLocal: false });
  await phone.sync.connect();
  assert.deepEqual(phone.local.state, desktop.local.state);
  // Each practises a different lesson. The desktop stayed open and has not seen the phone's save.
  phone.local.state = practise(phone.local.state, units[1]); phone.sync.queue();
  await phone.sync.flush();
  desktop.local.state = practise(desktop.local.state, units[2]); desktop.sync.queue();
  await desktop.sync.flush(); await desktop.sync.flush();
  assert.equal(desktop.sync.status, 'saved');
  // The phone picks the combined copy up when it comes back into view.
  await phone.sync.refresh();
  assert.equal(phone.sync.status, 'saved');
  assert.deepEqual(phone.local.state, desktop.local.state);
  assert.deepEqual(phone.local.state, (await actor.get()).state);
  for (const unit of [units[0], units[1], units[2]]) assert.ok(phone.local.state.courses['uz>en'].best[unit.id] > 0, unit.id);
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

test('cloud progress waits while an exercise is open; static-only hosting keeps local data', async () => {
  const actor = browser();
  await actor.put(await actor.get(), practise(save(5), units[1]));
  let exercise = true;
  const active = client(actor, save(1), { canApply: () => !exercise });
  await active.sync.connect();
  assert.equal(active.sync.status, 'pending');
  assert.deepEqual(active.local.state, save(1));
  // The exercise ends: the cloud progress is merged in, keeping the better score.
  exercise = false;
  await active.sync.flush(); await active.sync.flush();
  assert.equal(active.sync.status, 'saved');
  assert.deepEqual(active.local.state, (await actor.get()).state);
  assert.equal(active.local.state.courses['uz>en'].best[units[0].id], save(5).courses['uz>en'].best[units[0].id]);
  assert.ok(active.local.state.courses['uz>en'].best[units[1].id] > 0);
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
  assert.deepEqual(first.local.state, validateState(save(2)));
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
