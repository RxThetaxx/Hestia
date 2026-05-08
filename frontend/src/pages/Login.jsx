// Login.jsx — the login page
// Users enter their email and password to get a JWT token

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  // Form field values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dev only — skips the real login by stuffing a fake user into localStorage
  function devLogin(role) {
    var fakeUser = role === 'donor'
      ? { id: 1, name: 'Ananya Donor', email: 'donor@test.com', role: 'donor' }
      : { id: 2, name: 'Rohan Seeker', email: 'seeker@test.com', role: 'seeker' };

    localStorage.setItem('relish_token', 'mock-jwt-token-abc123');
    localStorage.setItem('relish_user', JSON.stringify(fakeUser));

    if (role === 'donor') {
      navigate('/my-listings');
    } else {
      navigate('/feed');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the page from refreshing
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the error message from the backend
        setErrorMsg(data.message || 'Login failed. Please try again.');
      } else {
        // Save the token and user info to localStorage
        localStorage.setItem('relish_token', data.token);
        localStorage.setItem('relish_user', JSON.stringify(data.user));

        // Redirect based on role
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* App name */}
        <h1 className="text-2xl font-semibold text-green-600 text-center mb-1">🥗 Relish</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Food redistribution, made simple.</p>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Welcome back</h2>

          {/* Error message */}
          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {errorMsg}
            </p>
          )}

          {/* Email field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white font-medium py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors mt-1"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Signup link */}
          <p className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        {/* Dev shortcuts — only shown when mock mode is on */}
        {import.meta.env.VITE_MOCK === 'true' && (
          <div className="mt-4 border border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
            <p className="text-xs font-medium text-orange-600 mb-2 text-center">
              🛠 Dev Mode — skip login
            </p>
            <div className="flex gap-2">
              <button
                onClick={function() { devLogin('seeker'); }}
                className="flex-1 text-xs border border-orange-400 text-orange-700 py-1.5 rounded hover:bg-orange-100 transition-colors"
              >
                Login as Seeker
              </button>
              <button
                onClick={function() { devLogin('donor'); }}
                className="flex-1 text-xs border border-orange-400 text-orange-700 py-1.5 rounded hover:bg-orange-100 transition-colors"
              >
                Login as Donor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;