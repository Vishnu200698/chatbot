// Simple sqlite wrapper using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.exec(`
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
`);

function redact(text) {
  if (!text) return text;
  // simple redaction: emails, phones, cc-like numbers
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CC]');
}

const insertStmt = db.prepare(`INSERT INTO messages
  (session_id, role, modality, content_text, duration_ms, safety_flags, model_info)
  VALUES (@session_id,@role,@modality,@content_text,@duration_ms,@safety_flags,@model_info)`);

function saveMessage({session_id, role, modality='text', content_text, duration_ms=null, safety_flags = '{}', model_info = '{}'}) {
  const redacted = redact(content_text);
  insertStmt.run({
    session_id,
    role,
    modality,
    content_text: redacted,
    duration_ms,
    safety_flags,
    model_info
  });
}

function getHistory(session_id, limit=50) {
  const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(session_id, limit);
}

module.exports = { saveMessage, getHistory };
