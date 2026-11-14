import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';
import { accountKeys } from '../dist/account-data.mjs';
import { progressEpoch, progressEpochHeader, resetLearningCaches } from '../dist/learning-reset.mjs';

function storage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
    key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  };
}

test('old learning caches are cleared without signing Telegram out', () => {
  const user = { telegramId: '700001', name: 'Tester' };
  const store = storage([
    ['aytim.account.last', JSON.stringify(user)],
    ['lingua-loop.v1', JSON.stringify({ base: 'uz', target: 'tr', courses: { 'uz>tr': { best: { greetings: 100 } } } })],
    ['aytim.cloud.v1', 'old guest metadata'],
    ['aytim.progress.telegram.700001', JSON.stringify({ base: 'uz', target: 'ar', transliterate: false, speaker: 'f', courses: { 'uz>ar': { best: { greetings: 100 } } } })],
    ['aytim.cloud.telegram.700001', 'old sync state'],
    ['aytim.import.telegram.700001', 'old guest claim'],
    ['aytim.progress.telegram.700002', 'another cached account'],
    ['unrelated.setting', 'preserved']
  ]);
  const tab = storage([['aytim.lesson.v1', 'old answers'], ['aytim.telegram.session', 'secure bearer']]);
  assert.equal(resetLearningCaches(store, tab), true);
  for (const key of ['lingua-loop.v1', 'aytim.cloud.v1', 'aytim.progress.telegram.700001',
    'aytim.cloud.telegram.700001', 'aytim.import.telegram.700001', 'aytim.progress.telegram.700002']) {
    assert.equal(store.getItem(key), null, key);
  }
  assert.deepEqual(JSON.parse(store.getItem('aytim.account.last')), user);
  assert.equal(tab.getItem('aytim.telegram.session'), 'secure bearer');
  assert.equal(tab.getItem('aytim.lesson.v1'), null);
  assert.equal(store.getItem('unrelated.setting'), 'preserved');
  assert.equal(resetLearningCaches(store, tab), false);
  assert.equal(accountKeys(user).progress, 'aytim.progress.v2.telegram.700001');
  assert.deepEqual(JSON.parse(store.getItem(accountKeys(user).progress)), {
    base: 'uz', target: 'ar', transliterate: false, speaker: 'f', courses: {}
  });
  assert.deepEqual(JSON.parse(store.getItem('aytim.progress.v2.guest')), {
    base: 'uz', target: 'tr', transliterate: true, courses: {}
  });
});

test('D1 resets every learning state once, preserving identity and active sessions', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  try {
    await migrate(mf);
    const db = await mf.getD1Database('DB');
    const now = Date.now(), token = 'a'.repeat(64);
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await db.batch([
      db.prepare('INSERT INTO learners (id, state_json, revision, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .bind('existing', JSON.stringify({ base: 'uz', target: 'ar', transliterate: false, speaker: 'f', courses: { 'uz>ar': { best: { greetings: 100 }, cards: {} } } }), 5, now, now),
      db.prepare(`INSERT INTO telegram_accounts (telegram_id, learner_id, display_name, created_at, last_login_at)
        VALUES (?, ?, ?, ?, ?)`).bind('700001', 'existing', 'Tester', now, now),
      db.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at, authenticated) VALUES (?, ?, ?, 1)')
        .bind(tokenHash, 'existing', now + 86400000)
    ]);

    const headers = { 'X-Aytim-Client': '1', Origin: 'https://aytim.test',
      Cookie: '__Host-aytim_session=' + token, 'X-Aytim-Account': '700001' };
    const signIn = await mf.dispatchFetch('https://aytim.test/api/auth/session', { headers });
    assert.equal(signIn.status, 200);
    assert.equal((await signIn.json()).user.telegramId, '700001');

    const row = await db.prepare('SELECT state_json, revision FROM learners WHERE id = ?').bind('existing').first();
    const settingsOnly = { base: 'uz', target: 'ar', transliterate: false, speaker: 'f', courses: {} };
    assert.deepEqual(JSON.parse(row.state_json), settingsOnly);
    assert.equal(row.revision, 6);
    assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM telegram_accounts').first()).count, 1);
    assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM learner_sessions').first()).count, 1);

    const saved = settingsOnly;
    const profile = await (await mf.dispatchFetch('https://aytim.test/api/progress', { headers })).json();
    assert.deepEqual(profile.state, settingsOnly);
    const body = JSON.stringify({ profileId: 'existing', revision: profile.revision, state: saved });
    const oldClient = await mf.dispatchFetch('https://aytim.test/api/progress', {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body
    });
    assert.equal(oldClient.status, 409, 'an old device cannot reupload its former scores');
    const updated = await mf.dispatchFetch('https://aytim.test/api/progress', {
      method: 'PUT', headers: { ...headers, [progressEpochHeader]: progressEpoch, 'Content-Type': 'application/json' }, body
    });
    assert.equal(updated.status, 200);
    const after = await (await mf.dispatchFetch('https://aytim.test/api/progress', { headers })).json();
    assert.deepEqual(after.state, saved, 'fresh scores are not cleared on the next request');
    assert.equal((await db.prepare('SELECT applied FROM learning_reset_events WHERE epoch = ?').bind(progressEpoch).first()).applied, 1);
  } finally {
    await mf.dispose();
  }
});
