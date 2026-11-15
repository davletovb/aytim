CREATE TABLE bot_story_sessions (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES telegram_accounts(telegram_id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  story_id TEXT NOT NULL,
  option_order TEXT NOT NULL CHECK (json_valid(option_order)),
  selected_index INTEGER CHECK (selected_index BETWEEN 0 AND 2),
  message_id INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX bot_story_expiry ON bot_story_sessions(expires_at);
CREATE INDEX bot_story_recency ON bot_story_sessions(telegram_id, created_at DESC);
