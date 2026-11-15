-- Chat practice is deliberately separate from Aytim's four-check objective review.
-- It is diagnostic only: never promotes cards, lesson grades, or XP.
CREATE TABLE bot_practice_sessions (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES telegram_accounts(telegram_id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  question TEXT NOT NULL,
  from_language TEXT NOT NULL,
  to_language TEXT NOT NULL,
  options_json TEXT NOT NULL CHECK (json_valid(options_json)),
  correct_index INTEGER NOT NULL CHECK(correct_index BETWEEN 0 AND 3),
  selected_index INTEGER CHECK(selected_index BETWEEN 0 AND 3),
  message_id INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX bot_practice_account ON bot_practice_sessions(telegram_id, created_at);
CREATE INDEX bot_practice_expiry ON bot_practice_sessions(expires_at);
