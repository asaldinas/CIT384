// server.js
import express from "express";
import bcrypt from "bcrypt";
import { DB } from "./connect.js";

const app = express();

// Parse JSON and form-urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => res.status(200).send("Service is online"));

// List users (never return passwords)
app.get("/api/users", (_req, res) => {
  const sql = `SELECT id, email, username, created_at FROM users ORDER BY id DESC`;
  DB.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ code: 500, status: err.message });
    res.json({ users: rows });
  });
});

// Create user
app.post("/api/users", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ code: 400, status: "email, username, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ code: 400, status: "password must be at least 8 characters" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const sql = `INSERT INTO users(email, username, hashed_password) VALUES(?, ?, ?)`;
    DB.run(sql, [email.trim(), username.trim(), hashed], function (err) {
      if (err) {
        // Unique constraint handling
        if (String(err.message).includes("UNIQUE")) {
          return res.status(409).json({ code: 409, status: "email or username already exists" });
        }
        return res.status(500).json({ code: 500, status: err.message });
      }

      return res.status(201).json({
        status: 201,
        id: this.lastID,
        message: `User ${username} created.`,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, status: "internal server error" });
  }
});

app.listen(3000, (err) => {
  if (err) return console.error("ERROR:", err.message);
  console.log("LISTENING on port 3000");
});
