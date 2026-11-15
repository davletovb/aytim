CREATE TABLE telegram_review_reminders (
  telegram_id TEXT PRIMARY KEY REFERENCES telegram_accounts(telegram_id) ON DELETE CASCADE,
  time_zone TEXT,
  frequency TEXT CHECK (frequency IN ('daily','weekly')),
  hour INTEGER NOT NULL DEFAULT 19 CHECK (hour IN (9,13,19,20)),
  muted_until INTEGER,
  next_at INTEGER,
  last_attempt_at INTEGER,
  revision INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX telegram_review_reminders_due ON telegram_review_reminders(next_at) WHERE next_at IS NOT NULL;
