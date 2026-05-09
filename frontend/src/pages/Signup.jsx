// Signup.jsx — the signup / registration page
// New users pick a name, email, password, and whether they are a Donor or Seeker

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();

  // Form field values — one state variable per input
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker'); // default to seeker
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Signup failed. Please try again.');
      } else {
        // Save token and user, then redirect
        localStorage.setItem('relish_token', data.token);
        localStorage.setItem('relish_user', JSON.stringify(data.user));

        if (data.user.role === 'donor') {
          navigate('/my-listings');
        } else {
          navigate('/feed');
        }
      }
    } catch (err) {
      setErrorMsg('Could not connect to the server. Is it running?');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* App name */}
        <h1 className="text-2xl font-semibold text-green-600 text-center mb-1">🥗 Relish</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Food redistribution, made simple.</p>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Create your account</h2>

          {/* Error message */}
          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {errorMsg}
            </p>
          )}

          {/* Name field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rishi Sharma"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Role selection — the most important choice at signup */}
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-role" className="text-sm font-medium text-gray-700">
              I am a...
            </label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
            >
              <option value="seeker">Seeker — I want to find food</option>
              <option value="donor">Donor — I want to give food</option>
            </select>
          </div>

          {/* Optional location fields */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Your Location <span className="text-gray-400 font-normal">(optional, for distance sorting)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="signup-lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitude"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-1/2 focus:outline-none focus:border-green-500"
              />
              <input
                id="signup-lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Longitude"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-1/2 focus:outline-none focus:border-green-500"
              />
            </div>
            <p className="text-xs text-gray-400">
              Find your coordinates at{' '}
              <a
                href="https://www.latlong.net"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                latlong.net
              </a>
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white font-medium py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors mt-1"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Login link */}
          <p className="text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
