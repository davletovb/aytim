import { maxSaveBytes, validateState } from '../dist/progress-data.mjs';
import { auth } from './auth.mjs';
import { body, cookie, json, requireSameOrigin } from './http.mjs';
import { guest, progress, session } from './sessions.mjs';

async function api(request, env) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/auth/')) return auth(request, env);
  requireSameOrigin(request);
  if (['/api/recovery-code', '/api/restore'].includes(url.pathname)) {
    return json({ error: 'Recovery codes have been replaced by Telegram sign-in' }, 410);
  }
  if (url.pathname !== '/api/progress') return json({ error: 'Not found' }, 404);
  if (!['GET', 'PUT'].includes(request.method)) return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, PUT' });
  if (!env.DB) return json({ error: 'Cloud saving is not configured' }, 503);
  const learner = await session(request, env.DB);
  const expectedAccount = request.headers.get('X-Aytim-Account');
  if (expectedAccount && learner?.telegram_id !== expectedAccount) return json({ error: 'Sign in again to sync progress' }, 401);
  if (request.method === 'GET') {
    if (learner) return json(progress(learner));
    const { learner: fresh, secret } = await guest(env.DB);
    return json(progress(fresh), 200, { 'Set-Cookie': cookie(request, secret, { seconds: 365 * 24 * 60 * 60 }) });
  }
  if (!learner) return json({ error: 'Session required. Sign in to save online.' }, 401);
  const input = await body(request, maxSaveBytes);
  if (!Number.isSafeInteger(input?.revision) || input.revision < 0 || input.profileId !== learner.id) {
    return json({ error: 'Invalid profile or revision' }, 400);
  }
  let state;
  try { state = validateState(input.state); }
  catch { return json({ error: 'Invalid learning progress' }, 400); }
  const updatedAt = Date.now();
  const result = await env.DB.prepare(`UPDATE learners SET state_json = ?, revision = revision + 1, updated_at = ?
    WHERE id = ? AND revision = ? AND EXISTS (
      SELECT 1 FROM learner_sessions s WHERE s.token_hash = ? AND s.learner_id = learners.id AND s.expires_at > ?
      AND s.authenticated = CASE WHEN EXISTS (SELECT 1 FROM telegram_accounts a WHERE a.learner_id = learners.id) THEN 1 ELSE 0 END
    ) RETURNING revision`).bind(JSON.stringify(state), updatedAt, learner.id, input.revision, learner.session_hash, updatedAt).first();
  if (!result) {
    if (!await session(request, env.DB)) return json({ error: 'Sign in again to sync progress' }, 401);
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
      return json({ error: error.status ? error.message : 'Cloud saving is temporarily unavailable' }, error.status ?? 503);
    }
  }
};
