CREATE TABLE bot_private_practice (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES telegram_accounts(telegram_id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('build','gap','dialogue')),
  unit_id TEXT NOT NULL,
  exercise_json TEXT NOT NULL CHECK (json_valid(exercise_json)),
  state_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(state_json)),
  version INTEGER NOT NULL DEFAULT 0,
  message_id INTEGER,
  expires_at INTEGER NOT NULL,
  completed_at INTEGER,
  correct INTEGER CHECK (correct IN (0,1))
);
CREATE INDEX bot_private_practice_recent ON bot_private_practice
  (telegram_id, learner_id, pair, completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX bot_private_practice_expiry ON bot_private_practice(expires_at);

ALTER TABLE telegram_review_reminders ADD COLUMN recap_enabled INTEGER NOT NULL DEFAULT 0
  CHECK (recap_enabled IN (0,1));
ALTER TABLE telegram_review_reminders ADD COLUMN next_recap_at INTEGER;
ALTER TABLE telegram_review_reminders ADD COLUMN last_recap_attempt_at INTEGER;
CREATE INDEX telegram_review_reminders_recap_due ON telegram_review_reminders(next_recap_at)
  WHERE next_recap_at IS NOT NULL;
