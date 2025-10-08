// connect.js
import sqlite3 from "sqlite3";
const sql3 = sqlite3.verbose();

// OPEN_CREATE so the DB file is created if missing
const DB = new sql3.Database(
  "./data.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("SQLite connect error:", err.message);
      return;
    }
    console.log("SQLite connected (data.db)");
  }
);

// Create table if it doesn't exist
const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;
DB.run(CREATE_USERS, (err) => {
  if (err) {
    console.error("Error creating users table:", err.message);
  } else {
    console.log("Users table ready");
  }
});

export { DB };
