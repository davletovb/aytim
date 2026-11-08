import { hash, readCookie, token } from './http.mjs';

export const tokenPattern = /^[a-f0-9]{64}$/;

export async function session(request, db) {
  const authorization = request.headers.get('Authorization');
  const value = authorization ? authorization.match(/^Bearer ([a-f0-9]{64})$/)?.[1] : readCookie(request);
  if (!value || !tokenPattern.test(value)) return null;
  return db.prepare(`SELECT learners.*, learner_sessions.token_hash AS session_hash,
    learner_sessions.import_from_learner_id, telegram_accounts.telegram_id,
    telegram_accounts.display_name, telegram_accounts.username
    FROM learner_sessions JOIN learners ON learners.id = learner_sessions.learner_id
    LEFT JOIN telegram_accounts ON telegram_accounts.learner_id = learners.id
    WHERE token_hash = ? AND expires_at > ? AND
      ((telegram_accounts.telegram_id IS NULL AND authenticated = 0) OR
       (telegram_accounts.telegram_id IS NOT NULL AND authenticated = 1))`)
    .bind(await hash(value), Date.now()).first();
}

export function publicUser(learner) {
  return learner?.telegram_id ? {
    telegramId: learner.telegram_id, name: learner.display_name, username: learner.username
  } : null;
}

export function progress(learner) {
  return {
    profileId: learner.id, state: learner.state_json ? JSON.parse(learner.state_json) : null,
    revision: learner.revision, updatedAt: learner.updated_at, user: publicUser(learner)
  };
}

export async function guest(db) {
  const secret = token();
  const now = Date.now();
  const learner = { id: crypto.randomUUID(), state_json: null, revision: 0, created_at: now, updated_at: now };
  await db.batch([
    db.prepare('INSERT INTO learners (id, created_at, updated_at) VALUES (?, ?, ?)').bind(learner.id, now, now),
    db.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at) VALUES (?, ?, ?)')
      .bind(await hash(secret), learner.id, now + 365 * 24 * 60 * 60 * 1000)
  ]);
  return { learner, secret };
}
