-- Bot review sessions are server-authoritative and owned by one Telegram learner.
-- No client-supplied answer keys, levels or vocabulary IDs are trusted.
CREATE TABLE bot_review_sessions (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES telegram_accounts(telegram_id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  round_json TEXT NOT NULL CHECK (json_valid(round_json)),
  cursor INTEGER NOT NULL DEFAULT 0,
  selected_source TEXT,
  matches_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(matches_json)),
  evaluations_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(evaluations_json)),
  version INTEGER NOT NULL DEFAULT 0,
  message_id INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  committed_at INTEGER
);
CREATE INDEX bot_review_owner ON bot_review_sessions(telegram_id, created_at);
CREATE INDEX bot_review_expiry ON bot_review_sessions(expires_at);
-- Bind an atomic learner-state update to exactly one consumed review session.
-- The trigger runs inside the same SQLite statement/transaction as the progress
-- revision increment. A retry cannot credit the same completed session twice.
ALTER TABLE learners ADD COLUMN last_bot_review_session_id TEXT;
CREATE TRIGGER bot_review_commit AFTER UPDATE OF last_bot_review_session_id ON learners
WHEN NEW.last_bot_review_session_id IS NOT NULL
BEGIN
  UPDATE bot_review_sessions SET committed_at = NEW.updated_at
  WHERE id = NEW.last_bot_review_session_id AND learner_id = NEW.id AND committed_at IS NULL;
END;
