import { maxSaveBytes, validateState } from '../dist/progress-data.mjs';

const year = 365 * 24 * 60 * 60;
const tokenPattern = /^[a-f0-9]{64}$/;

function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers }
  });
}

function token() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function cookieName(request) {
  return new URL(request.url).protocol === 'https:' ? '__Host-aytim_session' : 'aytim_session';
}

function cookie(request, value) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${cookieName(request)}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${year}${secure}`;
}

async function session(request, db) {
  const cookies = request.headers.get('Cookie') ?? '';
  const value = cookies.split(';').map(part => part.trim()).find(part => part.startsWith(cookieName(request) + '='))?.split('=')[1];
  if (!value || !tokenPattern.test(value)) return null;
  return db.prepare(`SELECT learners.* FROM learner_sessions
    JOIN learners ON learners.id = learner_sessions.learner_id
    WHERE token_hash = ? AND expires_at > ?`).bind(await hash(value), Date.now()).first();
}

function progress(learner) {
  return {
    profileId: learner.id, state: learner.state_json ? JSON.parse(learner.state_json) : null,
    revision: learner.revision, updatedAt: learner.updated_at
  };
}

async function body(request) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw Object.assign(new Error('Expected JSON'), { status: 415 });
  }
  if (Number(request.headers.get('Content-Length')) > maxSaveBytes) {
    throw Object.assign(new Error('Save is too large'), { status: 413 });
  }
  const reader = request.body?.getReader();
  if (!reader) throw Object.assign(new Error('Missing JSON'), { status: 400 });
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxSaveBytes) {
      await reader.cancel();
      throw Object.assign(new Error('Save is too large'), { status: 413 });
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

async function api(request, env) {
  const url = new URL(request.url);
  // A custom header forces a CORS preflight on other origins. No CORS access is granted.
  if (request.headers.get('X-Aytim-Client') !== '1' || request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
      (request.headers.has('Origin') && request.headers.get('Origin') !== url.origin)) {
    return json({ error: 'Same-origin requests only' }, 403);
  }
  const routes = { '/api/progress': ['GET', 'PUT'], '/api/recovery-code': ['POST'], '/api/restore': ['POST'] };
  const methods = routes[url.pathname];
  if (!methods) return json({ error: 'Not found' }, 404);
  if (!methods.includes(request.method)) return json({ error: 'Method not allowed' }, 405, { Allow: methods.join(', ') });
  if (!env.DB) return json({ error: 'Cloud saving is not configured' }, 503);

  if (url.pathname === '/api/restore') {
    const input = await body(request);
    if (!/^aytim-[a-f0-9]{64}$/.test(input?.code)) return json({ error: 'Invalid recovery code' }, 400);
    const learner = await env.DB.prepare('SELECT * FROM learners WHERE recovery_hash = ?').bind(await hash(input.code)).first();
    if (!learner) return json({ error: 'Recovery code not found' }, 404);
    const secret = token();
    await env.DB.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at) VALUES (?, ?, ?)')
      .bind(await hash(secret), learner.id, Date.now() + year * 1000).run();
    return json(progress(learner), 200, { 'Set-Cookie': cookie(request, secret) });
  }

  let learner = await session(request, env.DB);
  if (url.pathname === '/api/progress' && request.method === 'GET') {
    if (learner) return json(progress(learner));
    const secret = token();
    const now = Date.now();
    learner = { id: crypto.randomUUID(), state_json: null, revision: 0, created_at: now, updated_at: now };
    await env.DB.batch([
      env.DB.prepare('INSERT INTO learners (id, created_at, updated_at) VALUES (?, ?, ?)').bind(learner.id, now, now),
      env.DB.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at) VALUES (?, ?, ?)')
        .bind(await hash(secret), learner.id, now + year * 1000)
    ]);
    return json(progress(learner), 200, { 'Set-Cookie': cookie(request, secret) });
  }
  if (!learner) return json({ error: 'Session required. Enable cookies to save online.' }, 401);

  if (url.pathname === '/api/recovery-code') {
    const code = 'aytim-' + token();
    await env.DB.prepare('UPDATE learners SET recovery_hash = ? WHERE id = ?').bind(await hash(code), learner.id).run();
    return json({ code });
  }

  const input = await body(request);
  if (!Number.isSafeInteger(input?.revision) || input.revision < 0 || input.profileId !== learner.id) {
    return json({ error: 'Invalid profile or revision' }, 400);
  }
  let state;
  try { state = validateState(input.state); }
  catch { return json({ error: 'Invalid learning progress' }, 400); }
  const updatedAt = Date.now();
  const result = await env.DB.prepare(`UPDATE learners SET state_json = ?, revision = revision + 1, updated_at = ?
    WHERE id = ? AND revision = ? RETURNING revision`).bind(JSON.stringify(state), updatedAt, learner.id, input.revision).first();
  if (!result) {
    const current = await env.DB.prepare('SELECT * FROM learners WHERE id = ?').bind(learner.id).first();
    return json({ error: 'Progress changed on another device', ...progress(current) }, 409);
  }
  return json({ profileId: learner.id, revision: result.revision, updatedAt });
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (pathname !== '/api' && !pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try { return await api(request, env); }
    catch (error) {
      // Do not log save data, session cookies, or recovery codes.
      return json({ error: error.status ? error.message : 'Cloud saving is temporarily unavailable' }, error.status ?? 503);
    }
  }
};
