-- Run by the db.js bootstrap (here for reference)
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT,
  modality TEXT,
  content_text TEXT,
  duration_ms INTEGER,
  safety_flags TEXT,
  model_info TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
