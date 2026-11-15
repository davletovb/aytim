CREATE TABLE telegram_update_receipts (
  update_id INTEGER PRIMARY KEY,
  lease_id TEXT NOT NULL,
  lease_until INTEGER NOT NULL,
  completed_at INTEGER
);
CREATE INDEX telegram_update_receipts_expiry ON telegram_update_receipts(lease_until);
