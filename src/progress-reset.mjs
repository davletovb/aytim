import { progressEpoch } from '../dist/learning-reset.mjs';

// Idempotent D1 reset, automatically applied on the first API request after deployment.
// A transactional marker prevents later requests from erasing new work.
// Telegram identity, account ownership and sessions remain untouched.
let pending;
export function ensureProgressReset(db) {
  if (!pending) pending = (async () => {
    await db.prepare(`CREATE TABLE IF NOT EXISTS learning_reset_events (
      epoch TEXT PRIMARY KEY, applied INTEGER NOT NULL DEFAULT 0
    )`).run();
    await db.batch([
      db.prepare('INSERT OR IGNORE INTO learning_reset_events (epoch, applied) VALUES (?, 0)').bind(progressEpoch),
      db.prepare(`UPDATE learners SET state_json = json_set(state_json, '$.courses', json('{}')), revision = revision + 1, updated_at = ?
        WHERE state_json IS NOT NULL AND EXISTS (
          SELECT 1 FROM learning_reset_events WHERE epoch = ? AND applied = 0
        )`).bind(Date.now(), progressEpoch),
      db.prepare('UPDATE learning_reset_events SET applied = 1 WHERE epoch = ? AND applied = 0').bind(progressEpoch)
    ]);
  })().catch(error => { pending = null; throw error; });
  return pending;
}
