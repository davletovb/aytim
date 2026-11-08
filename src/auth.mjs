import { body, cookie, failure, hash, json, readCookie, requireSameOrigin, token } from './http.mjs';
import { progress, publicUser, session, tokenPattern } from './sessions.mjs';
import { pkceChallenge, telegramIssuer, verifyDesktopToken, verifyMiniApp } from './telegram.mjs';

function available(env) {
  return { miniAppEnabled: Boolean(env.TELEGRAM_BOT_TOKEN),
    webEnabled: Boolean(env.TELEGRAM_CLIENT_ID && env.TELEGRAM_CLIENT_SECRET && env.PUBLIC_APP_ORIGIN) };
}

function authState(learner, env) {
  return { ...available(env), user: publicUser(learner), profileId: learner?.id ?? null,
    importFromProfileId: learner?.import_from_learner_id ?? null };
}

function redirect(location, cookies = []) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  for (const value of cookies) headers.append('Set-Cookie', value);
  return new Response(null, { status: 303, headers });
}

function origin(request, env) {
  let configured;
  try { configured = new URL(env.PUBLIC_APP_ORIGIN); } catch { throw failure('Sign-in is unavailable', 503); }
  if (configured.origin !== env.PUBLIC_APP_ORIGIN || configured.origin !== new URL(request.url).origin ||
      (configured.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(configured.hostname))) {
    throw failure('Sign-in is unavailable', 503);
  }
  return configured.origin;
}

async function accountLogin(db, identity, current, { allowGuest = true } = {}) {
  const now = Date.now();
  const anonymous = allowGuest && current && !current.telegram_id ? current : null;
  let account = await db.prepare('SELECT * FROM telegram_accounts WHERE telegram_id = ?').bind(identity.telegramId).first();
  if (!account) {
    const candidate = anonymous?.id ?? crypto.randomUUID();
    await db.batch([
      db.prepare('INSERT INTO learners (id, created_at, updated_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING').bind(candidate, now, now),
      db.prepare(`INSERT INTO telegram_accounts (telegram_id, oidc_subject, learner_id, display_name, username, created_at, last_login_at)
        VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`)
        .bind(identity.telegramId, identity.subject ?? null, candidate, identity.name, identity.username, now, now)
    ]);
    account = await db.prepare('SELECT * FROM telegram_accounts WHERE telegram_id = ?').bind(identity.telegramId).first();
    // Two Telegram identities can race to claim the same anonymous browser.
    if (!account) {
      const own = crypto.randomUUID();
      await db.batch([
        db.prepare('INSERT INTO learners (id, created_at, updated_at) VALUES (?, ?, ?)').bind(own, now, now),
        db.prepare(`INSERT INTO telegram_accounts (telegram_id, oidc_subject, learner_id, display_name, username, created_at, last_login_at)
          VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(telegram_id) DO NOTHING`)
          .bind(identity.telegramId, identity.subject ?? null, own, identity.name, identity.username, now, now)
      ]);
      account = await db.prepare('SELECT * FROM telegram_accounts WHERE telegram_id = ?').bind(identity.telegramId).first();
    }
  }
  const guestOwner = anonymous && await db.prepare('SELECT telegram_id FROM telegram_accounts WHERE learner_id = ?').bind(anonymous.id).first();
  const importFrom = anonymous && (!guestOwner || guestOwner.telegram_id === identity.telegramId) ? anonymous.id : null;
  const secret = token();
  await db.batch([
    db.prepare(`UPDATE telegram_accounts SET oidc_subject = COALESCE(?, oidc_subject), display_name = ?, username = ?, last_login_at = ?
      WHERE telegram_id = ?`).bind(identity.subject ?? null, identity.name, identity.username, now, identity.telegramId),
    db.prepare('UPDATE learners SET recovery_hash = NULL WHERE id = ?').bind(account.learner_id),
    db.prepare('DELETE FROM learner_sessions WHERE learner_id = ? AND authenticated = 0').bind(account.learner_id),
    ...(current ? [db.prepare('DELETE FROM learner_sessions WHERE token_hash = ?').bind(current.session_hash)] : []),
    db.prepare(`INSERT INTO learner_sessions (token_hash, learner_id, expires_at, authenticated, import_from_learner_id)
      VALUES (?, ?, ?, 1, ?)`).bind(await hash(secret), account.learner_id, now + 30 * 24 * 60 * 60 * 1000, importFrom)
  ]);
  const learner = await db.prepare(`SELECT learners.*, telegram_accounts.telegram_id, telegram_accounts.display_name, telegram_accounts.username
    FROM learners JOIN telegram_accounts ON telegram_accounts.learner_id = learners.id WHERE learners.id = ?`).bind(account.learner_id).first();
  learner.import_from_learner_id = importFrom;
  return { learner, secret };
}

export async function auth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const webRoute = path === '/api/auth/telegram/start' || path === '/api/auth/telegram/callback';
  if (!webRoute) requireSameOrigin(request);
  const methods = {
    '/api/auth/session': 'GET', '/api/auth/miniapp': 'POST', '/api/auth/logout': 'POST',
    '/api/auth/telegram/start': 'GET', '/api/auth/telegram/callback': 'GET'
  };
  if (!methods[path]) return json({ error: 'Not found' }, 404);
  if (request.method !== methods[path]) return json({ error: 'Method not allowed' }, 405, { Allow: methods[path] });
  if (!env.DB) throw failure('Sign-in is unavailable', 503);
  const current = await session(request, env.DB);

  if (path === '/api/auth/session') return json(authState(current, env));
  if (path === '/api/auth/logout') {
    if (current) await env.DB.prepare('DELETE FROM learner_sessions WHERE token_hash = ?').bind(current.session_hash).run();
    const response = json({ user: null });
    response.headers.append('Set-Cookie', cookie(request, '', { seconds: 0 }));
    response.headers.append('Set-Cookie', cookie(request, '', { name: 'login', seconds: 0 }));
    return response;
  }
  if (path === '/api/auth/miniapp') {
    if (!env.TELEGRAM_BOT_TOKEN) throw failure('Telegram sign-in is temporarily unavailable', 503);
    const input = await body(request, 20000);
    const identity = await verifyMiniApp(input?.initData, env.TELEGRAM_BOT_TOKEN);
    if (!identity.fresh) {
      // An old launch can identify an already authenticated session, but cannot create or extend one.
      if (current?.telegram_id !== identity.telegramId) throw failure('Reopen the app from Telegram to sign in', 401);
      return json({ ...authState(current, env), ...progress(current) });
    }
    const { learner, secret } = await accountLogin(env.DB, identity, current);
    // A tab-scoped bearer also supports Telegram Web frames where third-party cookies are blocked.
    return json({ ...authState(learner, env), ...progress(learner), sessionToken: secret }, 200,
      { 'Set-Cookie': cookie(request, secret) });
  }

  const home = origin(request, env);
  if (!available(env).webEnabled) throw failure('Telegram sign-in is temporarily unavailable', 503);
  const callback = home + '/api/auth/telegram/callback';
  if (path.endsWith('/start')) {
    if (request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
        (request.headers.has('Origin') && request.headers.get('Origin') !== home)) throw failure('Same-origin requests only', 403);
    const state = token();
    const verifier = token();
    const nonce = token();
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM telegram_login_flows WHERE state_hash IN
        (SELECT state_hash FROM telegram_login_flows WHERE expires_at <= ? LIMIT 20)`).bind(now),
      env.DB.prepare(`INSERT INTO telegram_login_flows (state_hash, verifier, nonce, guest_session_hash, expires_at)
        VALUES (?, ?, ?, ?, ?)`).bind(await hash(state), verifier, nonce, current?.telegram_id ? null : current?.session_hash ?? null, now + 600000)
    ]);
    const target = new URL(telegramIssuer + '/auth');
    target.search = new URLSearchParams({ client_id: env.TELEGRAM_CLIENT_ID, redirect_uri: callback,
      response_type: 'code', scope: 'openid profile', state, nonce,
      code_challenge: await pkceChallenge(verifier), code_challenge_method: 'S256' }).toString();
    return redirect(target.href, [cookie(request, state, { name: 'login', seconds: 600 })]);
  }

  const clear = cookie(request, '', { name: 'login', seconds: 0 });
  try {
    const state = url.searchParams.get('state');
    if (!tokenPattern.test(state ?? '') || readCookie(request, 'login') !== state || url.searchParams.getAll('state').length !== 1) {
      throw failure('Invalid login state', 401);
    }
    const flow = await env.DB.prepare(`DELETE FROM telegram_login_flows WHERE state_hash = ? AND expires_at > ?
      RETURNING verifier, nonce, guest_session_hash`).bind(await hash(state), Date.now()).first();
    if (!flow || url.searchParams.has('error') || url.searchParams.getAll('code').length !== 1) throw failure('Login was not completed', 401);
    const code = url.searchParams.get('code');
    if (!code || code.length > 2048) throw failure('Invalid login code', 401);
    const response = await fetch(telegramIssuer + '/token', {
      method: 'POST', signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(env.TELEGRAM_CLIENT_ID + ':' + env.TELEGRAM_CLIENT_SECRET) },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: env.TELEGRAM_CLIENT_ID,
        redirect_uri: callback, code_verifier: flow.verifier })
    });
    if (!response.ok) throw failure('Login failed', 401);
    const tokens = await response.json();
    const identity = await verifyDesktopToken(tokens.id_token, env.TELEGRAM_CLIENT_ID, flow.nonce);
    const { secret } = await accountLogin(env.DB, identity, current, { allowGuest: current?.session_hash === flow.guest_session_hash });
    return redirect(home + '/?login=success', [clear, cookie(request, secret)]);
  } catch {
    // Provider responses, codes, signed launch data and secrets never appear in URLs or logs.
    return redirect(home + '/?login=failed', [clear]);
  }
}
