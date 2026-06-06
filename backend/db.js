const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'todo.db');

async function initDb() {
  // Ensure the parent directory of the database file exists
  const parentDir = path.dirname(dbPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      priority TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

module.exports = {
  initDb
};
