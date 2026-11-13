-- Reserve generated characters before calling Azure; prevents unbounded charges on cache misses.
CREATE TABLE IF NOT EXISTS azure_audio_budget (
  month TEXT PRIMARY KEY CHECK (length(month) = 7),
  characters INTEGER NOT NULL CHECK (characters >= 0)
);
