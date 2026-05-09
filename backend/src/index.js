// index.js — the main entry point of the backend server
// This file wires everything together: middleware, routes, and the server

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from our React frontend (running on a different port)
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default dev server port
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const claimRoutes = require('./routes/claims');

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/claims', claimRoutes);

// Health check — quick way to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Relish backend is running!' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Relish backend running at http://localhost:${PORT}`);
});
