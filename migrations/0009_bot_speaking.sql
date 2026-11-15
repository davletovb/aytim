CREATE TABLE bot_speaking_prompts (
  telegram_id TEXT PRIMARY KEY REFERENCES telegram_accounts(telegram_id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  message_id INTEGER NOT NULL,
  pair TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX bot_speaking_expiry ON bot_speaking_prompts(expires_at);
