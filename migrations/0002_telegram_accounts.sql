CREATE TABLE telegram_accounts (
  telegram_id TEXT PRIMARY KEY,
  oidc_subject TEXT UNIQUE,
  learner_id TEXT NOT NULL UNIQUE REFERENCES learners(id),
  display_name TEXT NOT NULL,
  username TEXT,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

ALTER TABLE learner_sessions ADD COLUMN authenticated INTEGER NOT NULL DEFAULT 0 CHECK (authenticated IN (0, 1));
ALTER TABLE learner_sessions ADD COLUMN import_from_learner_id TEXT;

CREATE TABLE telegram_login_flows (
  state_hash TEXT PRIMARY KEY,
  verifier TEXT NOT NULL,
  nonce TEXT NOT NULL,
  guest_session_hash TEXT,
  expires_at INTEGER NOT NULL
);

CREATE INDEX telegram_login_flows_expiry ON telegram_login_flows(expires_at);
