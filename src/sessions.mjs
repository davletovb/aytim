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

// An anonymous learner is reachable only through the cookie handed out with it.
// Once that session has expired the row can never be read or written again, so
// it is swept rather than kept for ever. Ninety days is long enough for someone
// who comes back now and then, and their progress also lives in their browser.
export const guestSessionDays = 90;
const sweepGraceDays = 7;
const sweepBatch = 20;

// Reclaims a few unreachable anonymous learners. Sessions cascade with the row.
// A learner that a Telegram account has claimed is never touched, and neither is
// one still inside the grace period, so a row made moments ago cannot be caught.
export function sweepGuests(db, now = Date.now()) {
  const stale = now - sweepGraceDays * 24 * 60 * 60 * 1000;
  return db.prepare(`DELETE FROM learners WHERE id IN (
      SELECT learners.id FROM learners
      LEFT JOIN telegram_accounts ON telegram_accounts.learner_id = learners.id
      WHERE telegram_accounts.learner_id IS NULL
        AND learners.updated_at <= ?
        AND NOT EXISTS (
          SELECT 1 FROM learner_sessions
          WHERE learner_sessions.learner_id = learners.id AND learner_sessions.expires_at > ?
        )
      LIMIT ?
    )`).bind(stale, now, sweepBatch);
}

export async function guest(db) {
  const secret = token();
  const now = Date.now();
  const learner = { id: crypto.randomUUID(), state_json: null, revision: 0, created_at: now, updated_at: now };
  await db.batch([
    // Making a new anonymous row is the moment to clear a few old ones.
    sweepGuests(db, now),
    db.prepare('INSERT INTO learners (id, created_at, updated_at) VALUES (?, ?, ?)').bind(learner.id, now, now),
    db.prepare('INSERT INTO learner_sessions (token_hash, learner_id, expires_at) VALUES (?, ?, ?)')
      .bind(await hash(secret), learner.id, now + guestSessionDays * 24 * 60 * 60 * 1000)
  ]);
  return { learner, secret };
}
