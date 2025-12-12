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

// ✅ Route for the LOGIN page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// (Optional) Clean route for register page if you want /register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Minimal email check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Register route
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

// ✅ Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Username and password are required.' });
    }

    // Find user by username OR email
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );

    if (rows.length === 0) {
      // Do NOT reveal if username or email is wrong; generic message
      return res.status(401).json({ ok: false, message: 'Invalid username or password.' });
    }

    const user = rows[0];

    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, message: 'Invalid username or password.' });
    }

    // At this point the user is authenticated.
    // Here you could set a session / JWT, etc.
    // For now, just send success.
    return res.json({
      ok: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
});

// ✅ Single app.listen
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
