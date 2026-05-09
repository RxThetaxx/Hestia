// routes/listings.js — handles food listing creation and fetching
// POST /api/listings        — donor creates a new listing
// GET  /api/listings        — anyone can see active listings (sorted by distance)
// GET  /api/listings/mine   — donor sees only their listings

const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// ── Helper: Haversine distance formula ───────────────────────────────────────
// Calculates distance in km between two lat/lng points
// This replaces PostGIS for the MVP — simple math, no extensions needed
function getDistanceInKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const diffLat = ((lat2 - lat1) * Math.PI) / 180;
  const diffLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(diffLng / 2) *
      Math.sin(diffLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

// ── CREATE LISTING ────────────────────────────────────────────────────────────
// Only donors can create listings
router.post('/', verifyToken, async (req, res) => {
  // Make sure the user is a donor
  if (req.user.role !== 'donor') {
    return res.status(403).json({ message: 'Only donors can create listings.' });
  }

  const { title, category, quantity, description, expiry_at, lat, lng } = req.body;

  if (!title || !category || !quantity || !expiry_at || !lat || !lng) {
    return res.status(400).json({ message: 'Title, category, quantity, expiry date, and location are required.' });
  }

  if (category !== 'packaged' && category !== 'homemade') {
    return res.status(400).json({ message: 'Category must be "packaged" or "homemade".' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (donor_id, title, category, quantity, description, expiry_at, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.userId, title, category, quantity, description || '', expiry_at, lat, lng]
    );

    res.status(201).json({
      message: 'Listing created successfully!',
      listing: result.rows[0],
    });
  } catch (err) {
    console.error('Create listing error:', err.message);
    res.status(500).json({ message: 'Failed to create listing. Please try again.' });
  }
});

// ── GET ALL ACTIVE LISTINGS ───────────────────────────────────────────────────
// Returns all active listings, sorted by proximity to the user
// Query params: ?lat=12.34&lng=56.78
router.get('/', verifyToken, async (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  try {
    // Fetch all active listings along with the donor's name
    const result = await pool.query(
      `SELECT listings.*, users.name AS donor_name
       FROM listings
       JOIN users ON listings.donor_id = users.id
       WHERE listings.status = 'active'
       ORDER BY listings.expiry_at ASC`
    );

    const listings = result.rows;

    // If the user provided their location, calculate distance for each listing
    if (!isNaN(userLat) && !isNaN(userLng)) {
      listings.forEach((item) => {
        item.distance_km = getDistanceInKm(
          userLat,
          userLng,
          parseFloat(item.lat),
          parseFloat(item.lng)
        ).toFixed(1);
      });

      // Sort by proximity (closest first)
      listings.sort((a, b) => a.distance_km - b.distance_km);
    }

    res.json({ listings });
  } catch (err) {
    console.error('Get listings error:', err.message);
    res.status(500).json({ message: 'Failed to fetch listings.' });
  }
});

// ── GET MY LISTINGS ───────────────────────────────────────────────────────────
// Donors see their own listings with pending claim counts
router.get('/mine', verifyToken, async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({ message: 'Only donors can view their listings.' });
  }

  try {
    const result = await pool.query(
      `SELECT listings.*,
              COUNT(claims.id) FILTER (WHERE claims.status = 'pending') AS pending_claim_count
       FROM listings
       LEFT JOIN claims ON listings.id = claims.listing_id
       WHERE listings.donor_id = $1
       GROUP BY listings.id
       ORDER BY listings.created_at DESC`,
      [req.user.userId]
    );

    res.json({ listings: result.rows });
  } catch (err) {
    console.error('Get my listings error:', err.message);
    res.status(500).json({ message: 'Failed to fetch your listings.' });
  }
});

module.exports = router;
