// FoodCard.jsx — displays a single food listing on the seeker's feed

import React, { useState } from 'react';

function FoodCard({ listing, onClaim }) {
  // Track whether a claim is being submitted for this card
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimedSuccessfully, setClaimedSuccessfully] = useState(false);

  // Format the expiry date to something readable
  function formatExpiry(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Figure out how urgent the expiry is
  function getExpiryColor(dateString) {
    const now = new Date();
    const expiry = new Date(dateString);
    const hoursLeft = (expiry - now) / (1000 * 60 * 60);

    if (hoursLeft < 2) return 'text-red-500';    // expires very soon
    if (hoursLeft < 6) return 'text-orange-500'; // expires in a few hours
    return 'text-gray-500';                       // plenty of time
  }

  async function handleClaimClick() {
    setIsClaiming(true);
    setClaimError('');

    try {
      const token = localStorage.getItem('relish_token');

      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ listing_id: listing.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setClaimError(data.message || 'Could not claim this listing.');
      } else {
        setClaimedSuccessfully(true);
        // Notify the parent Feed page so it can update its list
        if (onClaim) onClaim(listing.id);
      }
    } catch (err) {
      setClaimError('Network error. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      {/* Header: title + category badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base">{listing.title}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
          listing.category === 'homemade'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {listing.category === 'homemade' ? 'Home-made' : 'Packaged'}
        </span>
      </div>

      {/* Details row */}
      <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
        <span>🍽 {listing.quantity}</span>

        {listing.distance_km && (
          <span>📍 {listing.distance_km} km away</span>
        )}

        <span className={getExpiryColor(listing.expiry_at)}>
          ⏱ Expires {formatExpiry(listing.expiry_at)}
        </span>
      </div>

      {/* Description (if any) */}
      {listing.description && (
        <p className="text-sm text-gray-500">{listing.description}</p>
      )}

      {/* Donor name */}
      <p className="text-xs text-gray-400">Listed by {listing.donor_name}</p>

      {/* Claim button or status */}
      {claimedSuccessfully ? (
        <p className="text-green-600 text-sm font-medium">✓ Claimed! Waiting for donor to approve.</p>
      ) : (
        <>
          {claimError && (
            <p className="text-red-500 text-sm">{claimError}</p>
          )}
          <button
            onClick={handleClaimClick}
            disabled={isClaiming}
            className="mt-auto bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors w-full"
          >
            {isClaiming ? 'Claiming...' : 'Claim This Food'}
          </button>
        </>
      )}
    </div>
  );
}

export default FoodCard;