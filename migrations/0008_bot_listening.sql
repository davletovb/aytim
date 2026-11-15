ALTER TABLE bot_practice_sessions ADD COLUMN kind TEXT NOT NULL DEFAULT 'translation'
  CHECK (kind IN ('translation', 'listening'));
