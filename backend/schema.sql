-- Project Relish — Database Schema
-- Run this file once to set up the database:
-- psql -U postgres -d relish_db -f schema.sql

-- Users table — stores everyone who signs up
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'seeker')),
  -- lat and lng stored as plain decimals for MVP (no PostGIS needed)
  lat DECIMAL(9, 6),
  lng DECIMAL(9, 6),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Listings table — food items posted by donors
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  donor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  -- category is either 'packaged' or 'homemade'
  category VARCHAR(20) NOT NULL CHECK (category IN ('packaged', 'homemade')),
  quantity VARCHAR(100) NOT NULL,
  description TEXT,
  expiry_at TIMESTAMP NOT NULL,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  -- status moves from active → claimed → completed
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claims table — when a seeker wants a listing
CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  seeker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  -- status flow: pending → approved → collected
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'collected')),
  created_at TIMESTAMP DEFAULT NOW(),
  -- one seeker can only claim a listing once
  UNIQUE(listing_id, seeker_id)
);
