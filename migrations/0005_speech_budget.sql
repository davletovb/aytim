-- Seconds of learner audio sent for speech recognition, reserved before each request so that
-- recognition stays inside the free allowances. One row per provider and period:
-- 'azure:YYYY-MM' (monthly) and 'workers-ai:YYYY-MM-DD' (daily). No audio or transcript is stored.
CREATE TABLE IF NOT EXISTS speech_budget (
  period TEXT PRIMARY KEY CHECK (length(period) BETWEEN 8 AND 32),
  seconds INTEGER NOT NULL CHECK (seconds >= 0)
);
