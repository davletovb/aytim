CREATE TABLE learners (
  id TEXT PRIMARY KEY,
  state_json TEXT CHECK (state_json IS NULL OR json_valid(state_json)),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  recovery_hash TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE learner_sessions (
  token_hash TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE INDEX learner_sessions_learner ON learner_sessions(learner_id);
