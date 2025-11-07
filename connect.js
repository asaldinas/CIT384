// connect.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (same folder as server.js/connect.js)
dotenv.config({ path: path.join(__dirname, '.env') });

function requireEnv(name) {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

const pool = mysql.createPool({
  host: requireEnv('DB_HOST'),
  user: requireEnv('DB_USER'),
  password: process.env.DB_PASSWORD ?? '',       // allow empty string if you really use none
  database: requireEnv('DB_NAME'),
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
