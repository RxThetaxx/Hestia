// routes/claims.js — handles the claim handshake between seeker and donor
// POST  /api/claims          — seeker claims a listing (status: pending)
// GET   /api/claims/listing/:listing_id — donor sees all claims for their listing
// PATCH /api/claims/:id      — donor updates claim status (approve / collected)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// ── SEEKER CLAIMS A LISTING ───────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  // Only seekers can claim
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ message: 'Only seekers can claim food listings.' });
  }

  const { listing_id } = req.body;

  if (!listing_id) {
    return res.status(400).json({ message: 'listing_id is required.' });
  }

  try {
    // Check if the listing exists and is still active
    const listingResult = await pool.query(
      'SELECT id, status, donor_id FROM listings WHERE id = $1',
      [listing_id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    const listing = listingResult.rows[0];

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This listing is no longer available.' });
    }

    // A donor can't claim their own listing
    if (listing.donor_id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot claim your own listing.' });
    }

    // Create the claim (UNIQUE constraint prevents duplicate claims)
    const result = await pool.query(
      'INSERT INTO claims (listing_id, seeker_id) VALUES ($1, $2) RETURNING *',
      [listing_id, req.user.userId]
    );

    // Mark listing as claimed so nobody else can claim it
    await pool.query(
      'UPDATE listings SET status = $1 WHERE id = $2',
      ['claimed', listing_id]
    );

    res.status(201).json({
      message: 'Claim submitted! Waiting for donor to approve.',
      claim: result.rows[0],
    });
  } catch (err) {
    // Handle duplicate claim (PostgreSQL UNIQUE violation code is '23505')
    if (err.code === '23505') {
      return res.status(400).json({ message: 'You have already claimed this listing.' });
    }
    console.error('Claim error:', err.message);
    res.status(500).json({ message: 'Failed to submit claim. Please try again.' });
  }
});

// ── DONOR SEES CLAIMS FOR THEIR LISTING ──────────────────────────────────────
router.get('/listing/:listing_id', verifyToken, async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({ message: 'Only donors can view claims.' });
  }

  const { listing_id } = req.params;

  try {
    // Make sure this listing belongs to the logged-in donor
    const ownerCheck = await pool.query(
      'SELECT id FROM listings WHERE id = $1 AND donor_id = $2',
      [listing_id, req.user.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You do not own this listing.' });
    }

    const result = await pool.query(
      `SELECT claims.*, users.name AS seeker_name, users.email AS seeker_email
       FROM claims
       JOIN users ON claims.seeker_id = users.id
       WHERE claims.listing_id = $1
       ORDER BY claims.created_at ASC`,
      [listing_id]
    );

    res.json({ claims: result.rows });
  } catch (err) {
    console.error('Get claims error:', err.message);
    res.status(500).json({ message: 'Failed to fetch claims.' });
  }
});

// ── DONOR UPDATES A CLAIM STATUS ─────────────────────────────────────────────
// Donor can move: pending → approved, or approved → collected
router.patch('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({ message: 'Only donors can update claims.' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'collected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be "approved" or "collected".' });
  }

  try {
    // Verify this claim belongs to one of the donor's listings
    const claimResult = await pool.query(
      `SELECT claims.id, claims.listing_id, claims.status
       FROM claims
       JOIN listings ON claims.listing_id = listings.id
       WHERE claims.id = $1 AND listings.donor_id = $2`,
      [id, req.user.userId]
    );

    if (claimResult.rows.length === 0) {
      return res.status(403).json({ message: 'Claim not found or not yours to update.' });
    }

    // Update the claim status
    const updatedClaim = await pool.query(
      'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // If the handover is complete, mark the listing as completed too
    if (status === 'collected') {
      await pool.query(
        'UPDATE listings SET status = $1 WHERE id = $2',
        ['completed', claimResult.rows[0].listing_id]
      );
    }

    res.json({
      message: `Claim status updated to "${status}".`,
      claim: updatedClaim.rows[0],
    });
  } catch (err) {
    console.error('Update claim error:', err.message);
    res.status(500).json({ message: 'Failed to update claim.' });
  }
});

// ── SEEKER SEES THEIR OWN CLAIMS ─────────────────────────────────────────────
router.get('/mine', verifyToken, async (req, res) => {
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ message: 'Only seekers can view their claims.' });
  }

  try {
    const result = await pool.query(
      `SELECT claims.*, listings.title, listings.expiry_at, listings.lat, listings.lng,
              users.name AS donor_name
       FROM claims
       JOIN listings ON claims.listing_id = listings.id
       JOIN users ON listings.donor_id = users.id
       WHERE claims.seeker_id = $1
       ORDER BY claims.created_at DESC`,
      [req.user.userId]
    );

    res.json({ claims: result.rows });
  } catch (err) {
    console.error('Get my claims error:', err.message);
    res.status(500).json({ message: 'Failed to fetch your claims.' });
  }
});

module.exports = router;
