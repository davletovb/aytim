-- Supports the sweep that reclaims anonymous learners once their last session
-- has expired and the browser can no longer reach the row.
CREATE INDEX learners_updated_at ON learners(updated_at);
