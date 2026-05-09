// routes/auth.js — handles signup and login
// POST /api/auth/signup
// POST /api/auth/login

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// ── SIGNUP ────────────────────────────────────────────────────────────────────
// Creates a new user account
router.post('/signup', async (req, res) => {
  const { name, email, password, role, lat, lng } = req.body;

  // Basic input checks
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  if (role !== 'donor' && role !== 'seeker') {
    return res.status(400).json({ message: 'Role must be either "donor" or "seeker".' });
  }

  try {
    // Check if email is already taken
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password — never store plain text passwords!
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, lat, lng) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, passwordHash, role, lat || null, lng || null]
    );

    const newUser = result.rows[0];

    // Create a JWT token so the user is logged in immediately after signup
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token: token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Something went wrong on our end. Please try again.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// Logs in an existing user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    const user = result.rows[0];

    // Compare the provided password with the stored hash
    const passwordIsCorrect = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsCorrect) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Something went wrong on our end. Please try again.' });
  }
});

module.exports = router;
