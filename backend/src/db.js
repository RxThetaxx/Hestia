// db.js — sets up the connection pool to PostgreSQL
// We use 'pg' library which lets Node.js talk to Postgres

const { Pool } = require('pg');
require('dotenv').config();

// Pool keeps a set of connections open so we don't
// have to reconnect on every query
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test that we can connect when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

module.exports = pool;
