// Navbar.jsx — the top navigation bar shown on every protected page

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  // Get the current user's info from localStorage
  const savedUser = localStorage.getItem('relish_user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  function handleLogout() {
    // Clear everything from localStorage and send user to login
    localStorage.removeItem('relish_token');
    localStorage.removeItem('relish_user');
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Logo / brand name */}
      <Link to="/" className="text-green-600 font-semibold text-lg tracking-tight">
        🥗 Relish
      </Link>

      {/* Navigation links — different depending on user role */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        {user && user.role === 'seeker' && (
          <Link to="/feed" className="hover:text-green-600 transition-colors">
            Browse Food
          </Link>
        )}

        {user && user.role === 'donor' && (
          <>
            <Link to="/my-listings" className="hover:text-green-600 transition-colors">
              My Listings
            </Link>
            <Link to="/create-listing" className="hover:text-green-600 transition-colors">
              + New Listing
            </Link>
          </>
        )}

        {/* Show who is logged in and a logout button */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <span className="text-gray-500 text-xs capitalize">{user.role}</span>
            <span className="font-medium text-gray-800">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;