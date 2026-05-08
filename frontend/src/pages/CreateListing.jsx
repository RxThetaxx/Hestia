// CreateListing.jsx — the donor's form to post a new food listing

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function CreateListing() {
  const navigate = useNavigate();

  // Form field values — one per input
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('homemade');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [expiryAt, setExpiryAt] = useState('');
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
      const token = localStorage.getItem('relish_token');

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          quantity,
          description,
          expiry_at: expiryAt,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Failed to create listing.');
      } else {
        // Success — go back to the listings page
        navigate('/my-listings');
      }
    } catch (err) {
      setErrorMsg('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Post a New Food Listing</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4"
        >
          {/* Error message */}
          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {errorMsg}
            </p>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="listing-title" className="text-sm font-medium text-gray-700">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="listing-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dal Rice for 4 people"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label htmlFor="listing-category" className="text-sm font-medium text-gray-700">
              Food Type <span className="text-red-400">*</span>
            </label>
            <select
              id="listing-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
            >
              <option value="homemade">Home-made</option>
              <option value="packaged">Fast / Packaged</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label htmlFor="listing-quantity" className="text-sm font-medium text-gray-700">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              id="listing-quantity"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 5 meals, 2kg, 10 portions"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Description (optional) */}
          <div className="flex flex-col gap-1">
            <label htmlFor="listing-description" className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="listing-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Freshly cooked, no onion/garlic, packed in containers"
              rows={3}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          {/* Expiry datetime */}
          <div className="flex flex-col gap-1">
            <label htmlFor="listing-expiry" className="text-sm font-medium text-gray-700">
              Best Before / Expiry <span className="text-red-400">*</span>
            </label>
            <input
              id="listing-expiry"
              type="datetime-local"
              value={expiryAt}
              onChange={(e) => setExpiryAt(e.target.value)}
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Pickup Location (Lat / Lng) <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="listing-lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitude"
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-1/2 focus:outline-none focus:border-green-500"
              />
              <input
                id="listing-lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Longitude"
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-1/2 focus:outline-none focus:border-green-500"
              />
            </div>
            <p className="text-xs text-gray-400">
              Find coordinates at{' '}
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

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-md hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white font-medium py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
            >
              {isLoading ? 'Posting...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;