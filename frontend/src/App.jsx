// App.jsx — the root component that sets up all the page routes
// We use react-router-dom for navigation between pages

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — anyone can access these */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected pages — only logged-in users can see these */}
        {/* Seekers see the feed of available food */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute allowedRole="seeker">
              <Feed />
            </ProtectedRoute>
          }
        />

        {/* Donors create new listings here */}
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute allowedRole="donor">
              <CreateListing />
            </ProtectedRoute>
          }
        />

        {/* Donors see and manage their own listings */}
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute allowedRole="donor">
              <MyListings />
            </ProtectedRoute>
          }
        />

        {/* Redirect the root URL based on who is logged in */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch-all: send unknown URLs to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Decides where to send the user when they visit "/"
function RootRedirect() {
  const savedUser = localStorage.getItem('relish_user');

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(savedUser);

  if (user.role === 'donor') {
    return <Navigate to="/my-listings" replace />;
  } else {
    return <Navigate to="/feed" replace />;
  }
}

export default App;
