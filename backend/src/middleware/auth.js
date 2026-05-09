// middleware/auth.js — JWT verification middleware
// This runs before protected routes to check if the user is logged in

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  // The token comes in the Authorization header like: "Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  // Split "Bearer <token>" and grab just the token part
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token format is wrong. Use: Bearer <token>' });
  }

  // Verify the token using our secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the request so routes can use it
    req.user = decoded;
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired. Please log in again.' });
  }
}

module.exports = verifyToken;
