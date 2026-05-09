// ProtectedRoute.jsx — a wrapper component that checks if the user is logged in
// and has the right role before showing the protected page

import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
  // Read the saved user from localStorage
  const savedUser = localStorage.getItem('relish_user');
  const savedToken = localStorage.getItem('relish_token');

  // If there's no token or user, send them to login
  if (!savedToken || !savedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(savedUser);

  // If a specific role is required and the user doesn't have it, redirect them
  if (allowedRole && user.role !== allowedRole) {
    // Send seekers to feed, donors to their listings
    if (user.role === 'seeker') {
      return <Navigate to="/feed" replace />;
    } else {
      return <Navigate to="/my-listings" replace />;
    }
  }

  // All checks passed — show the actual page
  return children;
}

export default ProtectedRoute;
