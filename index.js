// server.js / index.js
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import pool from './connect.js';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';

const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Session Middleware ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'replace_this_secret', // TODO: set a real secret in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// ---------- File Uploads (multer) ----------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// ---------- Static Files ----------
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Body Parsers ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Routes for top-level pages ----------
app.get('/', (req, res) => {
  // User login page (index.html)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ---------- Auth Utilities ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Middleware to require ADMIN session for protected admin pages
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(403).send('Access denied. Admin login required.');
  }
  next();
}

// Middleware to require any logged-in USER (for tickets, etc.)
function requireUser(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res
      .status(403)
      .json({ ok: false, message: 'User must be logged in to submit a ticket.' });
  }
  next();
}

// ---------- API: Register ----------
app.post('/api/register', async (req, res) => {
  try {
    const { Email: email, username, password, password2 } = req.body;

    // Validations
    if (!email || !username || !password || !password2) {
      return res
        .status(400)
        .json({ ok: false, message: 'All fields are required.' });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ ok: false, message: 'Please provide a valid email.' });
    }
    if (password !== password2) {
      return res
        .status(400)
        .json({ ok: false, message: 'Passwords do not match.' });
    }
    if (password.length < 8) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    // Check existing
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (rows.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'A user with that email or username already exists.',
      });
    }

    // Hash & insert
    const password_hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
      [email, username, password_hash]
    );

    return res
      .status(201)
      .json({ ok: true, message: 'Registration successful.' });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        ok: false,
        message: 'A user with that email or username already exists.',
      });
    }
    console.error('Register error:', err);
    return res
      .status(500)
      .json({ ok: false, message: 'Internal server error.' });
  }
});

// ---------- API: User Login (non-admin) ----------
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: 'Username and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, is_admin FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, message: 'Invalid username or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ ok: false, message: 'Invalid username or password.' });
    }

    // Basic session for regular users (and admins)
    req.session.userId = user.id;
    req.session.isAdmin = !!user.is_admin;

    return res.json({
      ok: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: !!user.is_admin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res
      .status(500)
      .json({ ok: false, message: 'Internal server error.' });
  }
});

// ---------- API: Admin Login ----------
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: 'Username and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, is_admin FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, message: 'Invalid username or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ ok: false, message: 'Invalid username or password.' });
    }

    if (!user.is_admin) {
      return res
        .status(403)
        .json({ ok: false, message: 'You do not have admin access.' });
    }

    // Store admin session
    req.session.userId = user.id;
    req.session.isAdmin = true;

    return res.json({
      ok: true,
      message: 'Admin login successful.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: true,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res
      .status(500)
      .json({ ok: false, message: 'Internal server error.' });
  }
});

// ---------- API: Logout ----------
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: 'Logged out.' });
  });
});

// ---------- API: Create Ticket (from form.html) ----------
app.post(
  '/api/tickets',
  requireUser,
  upload.array('files', 10), // "files" must match name attribute in form
  async (req, res) => {
    try {
      const { description, location, category, comments } = req.body;

      // Validate required fields
      if (!description || !location || !category) {
        return res.status(400).json({
          ok: false,
          message: 'Description, location, and category are required.',
        });
      }

      // Collect uploaded image paths
      const imagePaths =
        req.files?.map((file) => `/uploads/${file.filename}`) || [];

      // Insert ticket into DB
      const [result] = await pool.query(
        `INSERT INTO tickets (user_id, description, image_paths, location, category, comments)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.session.userId, // user_id
          description,
          JSON.stringify(imagePaths),
          location,
          category,
          comments || null,
        ]
      );

      return res.json({
        ok: true,
        message: 'Ticket submitted successfully.',
        ticket_id: result.insertId,
      });
    } catch (err) {
      console.error('Ticket submission error:', err);
      return res
        .status(500)
        .json({ ok: false, message: 'Internal server error.' });
    }
  }
);

// ---------- Protected Admin Page ----------
app.get('/admin-dashboard', requireAdmin, (req, res) => {
  // This assumes you have public/admin-dashboard.html
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// ---------- Start Server ----------
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ loggedIn: true });
  }
  return res.json({ loggedIn: false });
});
