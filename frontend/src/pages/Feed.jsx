// Feed.jsx — the seeker's main page
// Shows all available food listings sorted by distance

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

function Feed() {
  // List of listings fetched from the server
  const [listings, setListings] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch listings when the page first loads
  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('relish_token');

      // Get the user's saved location so we can sort by distance
      const savedUser = localStorage.getItem('relish_user');
      const user = savedUser ? JSON.parse(savedUser) : null;

      // Build the URL with lat/lng query params if we have them
      let url = '/api/listings';
      if (user && user.lat && user.lng) {
        url = `/api/listings?lat=${user.lat}&lng=${user.lng}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Failed to load listings.');
      } else {
        setListings(data.listings);
      }
    } catch (err) {
      setErrorMsg('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  }

  // When a listing is claimed, remove it from the feed
  function handleListingClaimed(claimedListingId) {
    setListings((prevListings) =>
      prevListings.filter((item) => item.id !== claimedListingId)
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Available Food Near You</h1>
          <p className="text-sm text-gray-500 mt-1">
            {listings.length > 0
              ? `${listings.length} listing${listings.length !== 1 ? 's' : ''} available`
              : 'Looking for food...'}
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <p className="text-center text-gray-400 py-10">Loading listings...</p>
        )}

        {/* Error state */}
        {!isLoading && errorMsg && (
          <div className="text-center py-10">
            <p className="text-red-500 text-sm">{errorMsg}</p>
            <button
              onClick={fetchListings}
              className="mt-3 text-green-600 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !errorMsg && listings.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-4xl mb-3">🍽</p>
            <p className="text-gray-500 text-sm">No food listings available right now.</p>
            <p className="text-gray-400 text-xs mt-1">Check back soon — donors add new items daily!</p>
          </div>
        )}

        {/* Listings grid */}
        {!isLoading && !errorMsg && listings.length > 0 && (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <FoodCard
                key={listing.id}
                listing={listing}
                onClaim={handleListingClaimed}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Feed;