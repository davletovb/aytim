ALTER TABLE bot_review_sessions ADD COLUMN pending_feedback_json TEXT
  CHECK (pending_feedback_json IS NULL OR json_valid(pending_feedback_json));
