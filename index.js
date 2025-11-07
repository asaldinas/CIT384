// server.js
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import pool from './connect.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files from ./public
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON/form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route for the register page (optional; static already serves /register.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Minimal email check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Single register route (you had it twice)
app.post('/api/register', async (req, res) => {
  try {
    const { Email: email, username, password, password2 } = req.body;

    // Validations
    if (!email || !username || !password || !password2) {
      return res.status(400).json({ ok: false, message: 'All fields are required.' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ ok: false, message: 'Please provide a valid email.' });
    }
    if (password !== password2) {
      return res.status(400).json({ ok: false, message: 'Passwords do not match.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
    }

    // Check existing
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (rows.length > 0) {
      return res.status(409).json({ ok: false, message: 'A user with that email or username already exists.' });
    }

    // Hash & insert
    const password_hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
      [email, username, password_hash]
    );
    
    return res.status(201).json({ ok: true, message: 'Registration successful.' });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, message: 'A user with that email or username already exists.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
});

// ✅ Single app.listen (you had two)
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
