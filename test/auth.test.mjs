import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { workerOptions, migrate } from './worker-helper.mjs';
import { accountLogin } from '../src/auth.mjs';
import { TelegramAuth, insideTelegram, launchUserId, miniAppData } from '../dist/auth.mjs';
import { CloudSync } from '../dist/cloud-sync.mjs';
import { accountKeys, guestKeys, loadAccountProgress, rememberAccount, rememberedAccount } from '../dist/account-data.mjs';

const botId = '123456789';
const botToken = botId + ':test-only-bot-token';
const clientSecret = 'test-only+client/secret=%:x';
const issuer = 'https://oauth.telegram.org';
const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
const publicJwk = { ...await exportJWK(publicKey), kid: 'telegram-test-key', alg: 'RS256', use: 'sig' };
const codes = new Map();
let mf;
let lastExchange;

before(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({ ...workerOptions,
    bindings: { TELEGRAM_BOT_TOKEN: botToken, TELEGRAM_CLIENT_ID: botId,
      TELEGRAM_CLIENT_SECRET: clientSecret, PUBLIC_APP_ORIGIN: 'https://aytim.test' },
    outboundService: async request => {
      const url = new URL(request.url);
      if (url.href === issuer + '/.well-known/jwks.json') return Response.json({ keys: [publicJwk] });
      if (url.href !== issuer + '/token') return new Response('Unexpected outbound request', { status: 500 });
      const params = new URLSearchParams(await request.text());
      const fixture = codes.get(params.get('code'));
      codes.delete(params.get('code'));
      lastExchange = { params, authorization: request.headers.get('Authorization') };
      const [user, password] = Buffer.from(lastExchange.authorization?.replace(/^Basic /, '') ?? '', 'base64').toString()
        .split(':').map(part => decodeURIComponent(part.replace(/\+/g, ' ')));
      if (!fixture || params.get('grant_type') !== 'authorization_code' || params.get('client_id') !== botId ||
          params.get('redirect_uri') !== 'https://aytim.test/api/auth/telegram/callback' ||
          !lastExchange.authorization?.startsWith('Basic ') || user !== botId || password !== clientSecret ||
          createHash('sha256').update(params.get('code_verifier') ?? '').digest('base64url') !== fixture.challenge) {
        return Response.json({ error: 'invalid_grant' }, { status: 400 });
      }
      const now = Math.floor(Date.now() / 1000);
      const claims = { iss: issuer, aud: botId, sub: 'oidc-subject-' + fixture.id, id: Number(fixture.id),
        name: 'Desktop Learner', preferred_username: 'desktop_learner', nonce: fixture.nonce,
        iat: now, exp: now + 600, ...fixture.claims };
      const idToken = fixture.invalidJwt ?? await new SignJWT(claims)
        .setProtectedHeader({ alg: 'RS256', kid: 'telegram-test-key' }).sign(fixture.signingKey ?? privateKey);
      return Response.json({ id_token: idToken, access_token: 'not-used-by-aytim', token_type: 'Bearer' });
    }
  }));
  await migrate(mf);
});
after(async () => { await mf?.dispose(); });

function browser(persistCookies = true) {
  const cookies = new Map();
  return {
    cookies,
    account: null,
    identity() { return this.account ? { 'X-Aytim-Account': this.account } : {}; },
    async fetch(path, options = {}) {
      const headers = new Headers({ 'X-Aytim-Client': '1', Origin: 'https://aytim.test' });
      if (cookies.size) headers.set('Cookie', [...cookies].map(([key, value]) => key + '=' + value).join('; '));
      new Headers(options.headers).forEach((value, key) => headers.set(key, value));
      const response = await mf.dispatchFetch('https://aytim.test' + path, { ...options, redirect: 'manual', headers });
      if (persistCookies) for (const cookie of response.headers.getSetCookie()) {
        const [key, value] = cookie.split(';')[0].split('=');
        if (value) cookies.set(key, value); else cookies.delete(key);
      }
      return response;
    },
    async get(headers = {}) { return (await this.fetch('/api/progress', { headers: { ...this.identity(), ...headers } })).json(); },
    async put(profile, state, headers = {}) {
      return this.fetch('/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.identity(), ...headers },
        body: JSON.stringify({ profileId: profile.profileId, revision: profile.revision, state }) });
    },
    async mini(initData) {
      return this.fetch('/api/auth/miniapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData }) });
    }
  };
}

function signedLaunch(id, { age = 0, secret = botToken, fields = {}, user = {} } = {}) {
  const params = new URLSearchParams({ query_id: randomBytes(16).toString('hex'),
    auth_date: String(Math.floor(Date.now() / 1000) - age),
    user: JSON.stringify({ id: Number(id), first_name: 'Mini Learner', username: 'mini_learner', ...user }), ...fields });
  const data = [...params].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => key + '=' + value).join('\n');
  const key = createHmac('sha256', 'WebAppData').update(secret).digest();
  params.set('hash', createHmac('sha256', key).update(data).digest('hex'));
  return params.toString();
}

function state(score = 4) {
  return { base: 'uz', target: 'en', transliterate: true, courses: { 'uz>en': { best: { greetings: score }, cards: {} } } };
}

async function desktopStart(actor, id, overrides = {}) {
  const start = await actor.fetch('/api/auth/telegram/start', { headers: { 'X-Aytim-Client': '' } });
  assert.equal(start.status, 303);
  const authorization = new URL(start.headers.get('Location'));
  assert.equal(authorization.origin, issuer);
  assert.equal(authorization.searchParams.get('scope'), 'openid profile');
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  assert(!authorization.href.includes(clientSecret));
  const code = randomBytes(16).toString('hex');
  codes.set(code, { id, nonce: authorization.searchParams.get('nonce'),
    challenge: authorization.searchParams.get('code_challenge'), ...overrides });
  const callback = '/api/auth/telegram/callback?' + new URLSearchParams({ code, state: authorization.searchParams.get('state') });
  return { callback, authorization, code };
}

async function desktopLogin(actor, id, overrides) {
  const { callback } = await desktopStart(actor, id, overrides);
  return actor.fetch(callback, { headers: { 'Sec-Fetch-Site': 'cross-site', 'X-Aytim-Client': '' } });
}

function storage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
}

test('Mini App sign-in claims guest progress and revokes old anonymous sessions and recovery access', async () => {
  const actor = browser();
  const guest = await actor.get();
  await actor.put(guest, state());
  const oldSession = browser();
  for (const [key, value] of actor.cookies) oldSession.cookies.set(key, value);
  const db = await mf.getD1Database('DB');
  await db.prepare('UPDATE learners SET recovery_hash = ? WHERE id = ?').bind('old-recovery-hash', guest.profileId).run();
  const response = await actor.mini(signedLaunch('600001', { fields: { signature: 'also-signed-by-hmac' } }));
  assert.equal(response.status, 200);
  const account = await response.json();
  assert.equal(account.user.telegramId, '600001');
  assert.equal(account.profileId, guest.profileId);
  assert.equal(account.importFromProfileId, guest.profileId);
  assert(!('state' in account), 'the sync fetches progress; sign-in does not send it twice');
  assert.match(account.sessionToken, /^[a-f0-9]{64}$/);
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly; SameSite=Lax/);
  assert.equal((await oldSession.put({ ...guest, revision: 1 }, state(2))).status, 401);
  actor.account = '600001';
  const claimed = await actor.get();
  assert.equal(claimed.user.telegramId, '600001');
  assert.deepEqual(claimed.state, state());
  assert.equal((await db.prepare('SELECT recovery_hash FROM learners WHERE id = ?').bind(guest.profileId).first()).recovery_hash, null);
  assert.equal((await actor.fetch('/api/restore', { method: 'POST' })).status, 410);
  assert.notEqual((await oldSession.get()).profileId, account.profileId);
});

test('desktop OIDC uses PKCE and restores the same numeric Telegram account as the Mini App', async () => {
  const mini = browser();
  const account = await (await mini.mini(signedLaunch('600002'))).json();
  mini.account = '600002';
  await mini.put(await mini.get(), state(5));
  const desktop = browser();
  const guest = await desktop.get();
  await desktop.put(guest, state(1));
  const callback = await desktopLogin(desktop, '600002');
  assert.equal(callback.status, 303);
  assert.equal(callback.headers.get('Location'), 'https://aytim.test/?login=success');
  assert.equal(lastExchange.params.get('grant_type'), 'authorization_code');
  desktop.account = '600002';
  const current = await desktop.get();
  assert.equal(current.profileId, account.profileId);
  assert.equal(current.user.telegramId, '600002');
  assert.deepEqual(current.state, state(5));
  const session = await (await desktop.fetch('/api/auth/session')).json();
  assert.equal(session.importFromProfileId, guest.profileId);
  assert(!JSON.stringify(session).includes(clientSecret));
  assert(!('phone_number' in session.user));
});

test('switching Telegram identities cannot attach another account’s progress or sessions', async () => {
  const actor = browser();
  const first = await (await actor.mini(signedLaunch('600003'))).json();
  actor.account = '600003';
  const firstProfile = await actor.get();
  await actor.put(firstProfile, state(5));
  const second = await (await actor.mini(signedLaunch('600004'))).json();
  actor.account = '600004';
  assert.notEqual(first.profileId, second.profileId);
  assert.equal((await actor.get()).state, null);
  assert.equal(second.importFromProfileId, null);
  assert.equal((await actor.fetch('/api/progress', { headers: { 'X-Aytim-Account': '600003' } })).status, 401);
  assert.equal((await actor.put({ ...firstProfile, revision: firstProfile.revision + 1 }, state(1))).status, 400);
  const fresh = browser();
  await fresh.mini(signedLaunch('600003'));
  fresh.account = '600003';
  assert.deepEqual((await fresh.get()).state, state(5));
});

test('Mini App authentication rejects tampering, wrong bots, duplicates, expired launches and invalid users', async () => {
  const actor = browser();
  const valid = signedLaunch('600005');
  for (const launch of [valid.replace('mini_learner', 'hacked_user'), signedLaunch('600005', { secret: 'wrong-bot' }),
    valid + '&auth_date=1', signedLaunch('600005', { age: 301 }), signedLaunch('600005', { age: -120 }),
    signedLaunch('600005', { user: { id: '9007199254740993' } }), signedLaunch('600005', { user: { is_bot: true } }),
    signedLaunch('600005', { user: { first_name: {} } }), 'user=forged&hash=' + '0'.repeat(64)]) {
    assert.equal((await actor.mini(launch)).status, 401);
  }
  const good = await actor.mini(valid);
  assert.equal(good.status, 200);
  actor.account = '600005';
  const before = await (await mf.getD1Database('DB')).prepare('SELECT COUNT(*) AS count, MAX(expires_at) AS expiry FROM learner_sessions WHERE learner_id = ?')
    .bind((await good.json()).profileId).first();
  assert.equal((await actor.mini(signedLaunch('600005', { age: 3600 }))).status, 200);
  const after = await (await mf.getD1Database('DB')).prepare('SELECT COUNT(*) AS count, MAX(expires_at) AS expiry FROM learner_sessions WHERE learner_id = ?')
    .bind((await actor.get()).profileId).first();
  assert.deepEqual(after, before);
  assert.equal((await actor.mini(signedLaunch('600099', { age: 3600 }))).status, 401);
});

test('OAuth callbacks reject wrong state, missing browser cookies, expiry, replay and bad token claims', async () => {
  const actor = browser();
  const wrong = await desktopStart(actor, '600006');
  const modified = new URL('https://aytim.test' + wrong.callback);
  modified.searchParams.set('state', 'f'.repeat(64));
  assert.equal((await actor.fetch(modified.pathname + modified.search)).headers.get('Location'), 'https://aytim.test/?login=failed');
  const missing = await desktopStart(actor, '600006');
  assert.equal((await browser().fetch(missing.callback)).headers.get('Location'), 'https://aytim.test/?login=failed');
  const expired = await desktopStart(actor, '600006');
  await (await mf.getD1Database('DB')).prepare('UPDATE telegram_login_flows SET expires_at = 0').run();
  assert.equal((await actor.fetch(expired.callback)).headers.get('Location'), 'https://aytim.test/?login=failed');
  const badKey = (await generateKeyPair('RS256')).privateKey;
  for (const fixture of [{ claims: { nonce: 'wrong' } }, { claims: { iss: 'https://attacker.test' } },
    { claims: { aud: 'another-client' } }, { claims: { exp: 1 } }, { claims: { id: null } },
    { claims: { sub: '' } }, { signingKey: badKey }, { invalidJwt: 'not.a.valid.jwt' }]) {
    assert.equal((await desktopLogin(actor, '600006', fixture)).headers.get('Location'), 'https://aytim.test/?login=failed');
  }
  const good = await desktopStart(actor, '600006');
  assert.equal((await actor.fetch(good.callback)).headers.get('Location'), 'https://aytim.test/?login=success');
  assert.equal((await actor.fetch(good.callback)).headers.get('Location'), 'https://aytim.test/?login=failed');
  actor.account = '600006';
  assert.equal((await actor.get()).user.telegramId, '600006');
  assert.equal((await actor.fetch('/api/auth/telegram/start', { headers: { Origin: 'https://attacker.test' } })).status, 403);
});

test('sign-out revokes the current session without signing out another device', async () => {
  const first = browser();
  const result = await (await first.mini(signedLaunch('600007'))).json();
  const second = browser();
  await second.mini(signedLaunch('600007'));
  second.account = '600007';
  const stolen = browser();
  stolen.account = '600007';
  for (const [key, value] of first.cookies) stolen.cookies.set(key, value);
  assert.equal((await first.fetch('/api/auth/logout', { method: 'POST' })).status, 200);
  assert.equal((await first.fetch('/api/auth/session').then(response => response.json())).user, null);
  assert.equal((await stolen.put(result, state())).status, 401);
  assert.equal((await second.get()).user.telegramId, '600007');
});

test('deleting an account removes its progress and every session it has anywhere', async () => {
  const phone = browser();
  await phone.mini(signedLaunch('600042'));
  phone.account = '600042';
  const saved = await phone.get();
  assert.equal((await phone.put(saved, state())).status, 200);
  const laptop = browser();
  await laptop.mini(signedLaunch('600042'));
  laptop.account = '600042';
  assert.ok(Object.keys((await laptop.get()).state.courses['uz>en'].best).length, 'the other device sees the progress');

  // A guest cannot delete anything.
  const visitor = browser();
  await visitor.get();
  assert.equal((await visitor.fetch('/api/auth/delete', { method: 'POST' })).status, 401);

  const gone = await phone.fetch('/api/auth/delete', { method: 'POST' });
  assert.equal(gone.status, 200);
  assert.equal((await gone.json()).deleted, true);
  assert.equal((await phone.fetch('/api/auth/session').then(response => response.json())).user, null);

  // The other device's session died with the account, and its progress is gone.
  assert.equal((await laptop.put(saved, state())).status, 401);
  const db = await mf.getD1Database('DB');
  for (const [sql, bound] of [
    ['SELECT COUNT(*) AS total FROM telegram_accounts WHERE telegram_id = ?', '600042'],
    ['SELECT COUNT(*) AS total FROM learners WHERE id = ?', saved.profileId],
    ['SELECT COUNT(*) AS total FROM learner_sessions WHERE learner_id = ?', saved.profileId]
  ]) {
    assert.equal((await db.prepare(sql).bind(bound).first()).total, 0, sql);
  }

  // Signing in again starts a clean account rather than reviving the old one.
  const again = browser();
  const fresh = await (await again.mini(signedLaunch('600042'))).json();
  again.account = '600042';
  assert.notEqual(fresh.profileId, saved.profileId);
  assert.equal((await again.get()).state, null);
});

test('concurrent identities claiming one guest cannot end up sharing a learner', async () => {
  const first = browser();
  const guest = await first.get();
  await first.put(guest, state(3));
  const second = browser();
  for (const [key, value] of first.cookies) second.cookies.set(key, value);
  const results = await Promise.all([first.mini(signedLaunch('600008')), second.mini(signedLaunch('600009'))]);
  assert(results.every(response => response.status === 200));
  const accounts = await Promise.all(results.map(response => response.json()));
  assert.notEqual(accounts[0].profileId, accounts[1].profileId);
  first.account = '600008';
  second.account = '600009';
  const saved = await Promise.all([first.get(), second.get()]);
  assert.equal(saved.filter(profile => profile.state !== null).length, 1);
});

test('a sign-in that loses the race to create its account leaves no empty learner row', async () => {
  const db = await mf.getD1Database('DB');
  const winner = browser();
  const won = await (await winner.mini(signedLaunch('600021'))).json();
  // Simulate the losing request: its lookup ran before the winning request committed the account.
  let hidden = false;
  const racing = new Proxy(db, { get(target, key) {
    if (key !== 'prepare') return typeof target[key] === 'function' ? target[key].bind(target) : target[key];
    return sql => {
      if (hidden || !sql.startsWith('SELECT * FROM telegram_accounts WHERE telegram_id')) return target.prepare(sql);
      hidden = true;
      return { bind: () => ({ first: async () => null }) };
    };
  } });
  const learners = () => db.prepare('SELECT COUNT(*) AS count FROM learners').first('count');
  const before = await learners();
  const { learner } = await accountLogin(racing, { telegramId: '600021', name: 'Mini Learner', username: null }, null);
  assert(hidden);
  assert.equal(learner.id, won.profileId);
  assert.equal(await learners(), before);
});

test('Telegram Web frames can authenticate and save without third-party cookies', async () => {
  const frame = browser(false);
  const tabStorage = storage();
  const auth = new TelegramAuth({ storage: tabStorage, initData: signedLaunch('600010'), fetcher: frame.fetch.bind(frame) });
  const identity = await auth.load();
  assert.equal(identity.user.telegramId, '600010');
  const saved = state(4);
  const sync = new CloudSync({ storage: storage(), getState: () => saved, applyState: () => {},
    accountId: identity.user.telegramId, fetcher: (input, options) => auth.fetch(input, options) });
  try {
    await sync.connect(); await sync.flush();
    assert.equal(sync.status, 'saved');
    assert.equal(frame.cookies.size, 0);
    const profile = await auth.fetch('/api/progress', { headers: { 'X-Aytim-Client': '1', 'X-Aytim-Account': '600010' } })
      .then(response => response.json());
    assert.deepEqual(profile.state, saved);
    await auth.logout();
    assert.equal(tabStorage.getItem('aytim.telegram.session'), null);
    sync.queue(); await sync.flush();
    assert.equal(sync.status, 'signin');
    assert.equal(sync.dirty, true);
  } finally { sync.stop(); }
});

test('account caches stay separate and a first sign-in carries over only its verified guest progress', () => {
  const local = storage();
  const a = { telegramId: '600011' };
  const b = { telegramId: '600012' };
  local.setItem(guestKeys.progress, JSON.stringify(state(3)));
  local.setItem(guestKeys.metadata, JSON.stringify({ profileId: 'guest', revision: 2, snapshot: JSON.stringify(state(2)) }));
  const migrated = loadAccountProgress(local, { user: a, profileId: 'guest', importFromProfileId: 'guest' });
  assert.equal(migrated.migrated, true);
  assert.deepEqual(migrated.state, state(3));
  assert.equal(JSON.parse(local.getItem(accountKeys(a).metadata)).revision, 2);
  assert.equal(local.getItem(guestKeys.progress), null);
  local.setItem(accountKeys(a).progress, JSON.stringify(state(5)));
  assert.deepEqual(loadAccountProgress(local, { user: b }).state.courses, {});
  local.setItem(guestKeys.progress, JSON.stringify(state(1)));
  local.setItem(guestKeys.metadata, JSON.stringify({ profileId: 'another-guest' }));
  const pending = loadAccountProgress(local, { user: a, profileId: 'account-a', importFromProfileId: 'another-guest' });
  assert.deepEqual(pending.state, state(5));
  assert.deepEqual(pending.guestState, state(1));
  assert(local.getItem(guestKeys.progress));
  const blocked = loadAccountProgress(local, { user: b, importFromProfileId: 'not-this-device' });
  assert.deepEqual(blocked.state.courses, {});
});

test('Mini App launch detection uses signed raw data and never trusts the unsafe user object', () => {
  const raw = signedLaunch('600013');
  const hash = { hash: '#' + new URLSearchParams({ tgWebAppData: raw }) };
  const mobile = { TelegramWebviewProxy: {} };
  const frame = {};
  frame.parent = {};
  assert.equal(miniAppData(hash, null, mobile), raw);
  assert.equal(miniAppData(hash, null, frame), raw);
  assert.equal(miniAppData(hash, null, { external: { notify() {} } }), raw);
  assert.equal(miniAppData({ hash: '' }, { initData: raw, initDataUnsafe: { user: { id: 999 } } }, mobile), raw);
  assert.equal(miniAppData({ hash: '' }, { initDataUnsafe: { user: { id: 999 } } }, mobile), '');
  assert.equal(launchUserId(raw), '600013');
  assert.equal(launchUserId('user=%7B%22id%22%3A%22x%22%7D'), null);
});

test('launch data in a regular browser tab is ignored, so a crafted link cannot sign the visitor in', () => {
  const tab = {};
  tab.parent = tab;
  assert.equal(insideTelegram(tab), false);
  assert.equal(insideTelegram({ external: {} }), false);
  assert.equal(miniAppData({ hash: '#' + new URLSearchParams({ tgWebAppData: signedLaunch('600015') }) }, null, tab), '');
  assert.equal(new TelegramAuth({ initData: miniAppData({ hash: '#tgWebAppData=x' }, null, tab) }).isMiniApp, false);
});

test('a guest client cannot read or write a signed-in session, even through the shared cookie', async () => {
  const actor = browser();
  const guest = await actor.get();
  await actor.put(guest, state(2));
  const account = await (await actor.mini(signedLaunch('600016'))).json();
  actor.account = '600016';
  assert.equal((await actor.put(await actor.get(), state(6))).status, 200);
  // A tab still in guest mode sends no account, as after another tab signed in or a failed sign-in check.
  actor.account = null;
  const read = await actor.fetch('/api/progress');
  assert.equal(read.status, 401);
  const body = await read.json();
  assert.equal(body.reason, 'account');
  assert(!('state' in body));
  assert.equal((await actor.put({ ...account, revision: 2 }, state(1))).status, 401);
  assert.equal((await actor.put({ ...account, revision: 2 }, state(1), { 'X-Aytim-Account': '600099' })).status, 401);
  const sync = new CloudSync({ storage: storage(), getState: () => state(1), applyState: () => assert.fail('adopted account progress'),
    hasLocal: true, fetcher: actor.fetch.bind(actor) });
  try {
    await sync.connect();
    assert.equal(sync.status, 'signin');
    assert.equal(sync.ready, false);
  } finally { sync.stop(); }
  actor.account = '600016';
  assert.deepEqual((await actor.get()).state, state(6));
});

test('a failed sign-in check reopens only the last verified account cache', () => {
  const local = storage();
  assert.equal(rememberedAccount(local), null);
  rememberAccount(local, { telegramId: '600017', name: 'Mini Learner', username: null });
  assert.equal(rememberedAccount(local).telegramId, '600017');
  assert.equal(rememberedAccount(local, '600017').name, 'Mini Learner');
  assert.equal(rememberedAccount(local, '600018'), null);
  assert.equal(rememberedAccount(local, null), null);
  local.setItem('aytim.account.last', JSON.stringify({ telegramId: 600017, name: 'Mini Learner' }));
  assert.equal(rememberedAccount(local), null);
  rememberAccount(local, null);
  assert.equal(rememberedAccount(local), null);
});

test('desktop sign-in is reported unavailable on other hosts and returns to the app instead of a JSON page', async () => {
  const headers = { 'X-Aytim-Client': '1', Origin: 'https://preview.aytim.test' };
  const config = await mf.dispatchFetch('https://preview.aytim.test/api/auth/session', { headers }).then(response => response.json());
  assert.equal(config.webEnabled, false);
  assert.equal(config.miniAppEnabled, true);
  for (const path of ['/api/auth/telegram/start', '/api/auth/telegram/callback?code=x&state=' + 'a'.repeat(64)]) {
    const response = await mf.dispatchFetch('https://preview.aytim.test' + path, { redirect: 'manual' });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('Location'), '/?login=failed');
  }
  assert.equal((await (await browser().fetch('/api/auth/session')).json()).webEnabled, true);
});

test('an unanswered guest-progress choice survives later sign-ins that no longer name the guest', () => {
  const local = storage();
  const a = { telegramId: '600019' };
  local.setItem(accountKeys(a).progress, JSON.stringify(state(5)));
  local.setItem(guestKeys.progress, JSON.stringify(state(1)));
  local.setItem(guestKeys.metadata, JSON.stringify({ profileId: 'guest-19' }));
  assert.deepEqual(loadAccountProgress(local, { user: a, importFromProfileId: 'guest-19' }).guestState, state(1));
  // The next Mini App launch rotates the session, and the Worker no longer names the guest.
  assert.deepEqual(loadAccountProgress(local, { user: a, importFromProfileId: null }).guestState, state(1));
  assert.equal(loadAccountProgress(local, { user: { telegramId: '600020' } }).guestState, null);
  // Once the copies match, the guest save is claimed and the reminder is cleared.
  local.setItem(accountKeys(a).progress, JSON.stringify(state(1)));
  const claimed = loadAccountProgress(local, { user: a });
  assert.equal(claimed.migrated, true);
  assert.equal(local.getItem(accountKeys(a).importFrom), null);
  assert.equal(local.getItem(guestKeys.progress), null);
});

test('blocked browser storage is reported when progress loads', () => {
  const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); }, removeItem() {} };
  assert.equal(loadAccountProgress(blocked, { user: null }).storageAvailable, false);
  const damaged = storage();
  damaged.setItem(guestKeys.progress, '{not json');
  const result = loadAccountProgress(damaged, { user: null });
  assert.equal(result.storageAvailable, true);
  assert.equal(result.hasLocal, false);
});

test('upgrading an existing progress database preserves guest saves and permits account claiming', async () => {
  const existing = new Miniflare(convertV4MiniflareOptions({ ...workerOptions, bindings: { TELEGRAM_BOT_TOKEN: botToken } }));
  try {
    const db = await existing.getD1Database('DB');
    const apply = async name => {
      const sql = await readFile(new URL('../migrations/' + name, import.meta.url), 'utf8');
      for (const statement of sql.split(';').filter(part => part.trim())) await db.prepare(statement).run();
    };
    await apply('0001_progress.sql');
    const secret = randomBytes(32).toString('hex');
    const now = Date.now();
    await db.prepare('INSERT INTO learners (id, state_json, revision, recovery_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind('legacy-profile', JSON.stringify(state(5)), 4, 'legacy-recovery-hash', now, now).run();
    await db.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at) VALUES (?, ?, ?)')
      .bind(createHash('sha256').update(secret).digest('hex'), 'legacy-profile', now + 600000).run();
    await apply('0002_telegram_accounts.sql');
    const headers = { 'X-Aytim-Client': '1', Cookie: '__Host-aytim_session=' + secret };
    const current = await existing.dispatchFetch('https://aytim.test/api/progress', { headers }).then(response => response.json());
    assert.equal(current.profileId, 'legacy-profile');
    assert.deepEqual(current.state, state(5));
    assert.equal(current.revision, 4);
    const claimed = await existing.dispatchFetch('https://aytim.test/api/auth/miniapp', { method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ initData: signedLaunch('600014') })
    }).then(response => response.json());
    assert.equal(claimed.profileId, 'legacy-profile');
    assert.equal(claimed.user.telegramId, '600014');
    const synced = await existing.dispatchFetch('https://aytim.test/api/progress', {
      headers: { 'X-Aytim-Client': '1', 'X-Aytim-Account': '600014', Authorization: 'Bearer ' + claimed.sessionToken }
    }).then(response => response.json());
    assert.deepEqual(synced.state, state(5));
    assert.equal((await db.prepare('SELECT recovery_hash FROM learners WHERE id = ?').bind('legacy-profile').first()).recovery_hash, null);
  } finally { await existing.dispose(); }
});
