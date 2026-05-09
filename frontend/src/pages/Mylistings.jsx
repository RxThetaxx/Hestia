// MyListings.jsx — the donor's dashboard
// Shows their own listings and lets them manage incoming claims

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MyListings() {
  // The donor's listings
  const [listings, setListings] = useState([]);

  // When a donor clicks a listing, we show its claims in a panel
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [claims, setClaims] = useState([]);

  // UI state
  const [listingsLoading, setListingsLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch the donor's listings when the page loads
  useEffect(() => {
    fetchMyListings();
  }, []);

  async function fetchMyListings() {
    setListingsLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('relish_token');

      const response = await fetch('/api/listings/mine', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Failed to load your listings.');
      } else {
        setListings(data.listings);
      }
    } catch (err) {
      setErrorMsg('Could not connect to the server.');
    } finally {
      setListingsLoading(false);
    }
  }

  // Fetch claims for a specific listing
  async function fetchClaimsForListing(listingId) {
    setSelectedListingId(listingId);
    setClaimsLoading(true);
    setClaims([]);

    try {
      const token = localStorage.getItem('relish_token');

      const response = await fetch(`/api/claims/listing/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        setClaims(data.claims);
      }
    } catch (err) {
      // silently fail — the donor can retry by clicking the listing again
    } finally {
      setClaimsLoading(false);
    }
  }

  // Update a claim's status (approve or mark collected)
  async function updateClaimStatus(claimId, newStatus) {
    try {
      const token = localStorage.getItem('relish_token');

      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the claim in state without re-fetching
        setClaims((prevClaims) =>
          prevClaims.map((c) =>
            c.id === claimId ? { ...c, status: newStatus } : c
          )
        );
        // Also refresh the listing list to update status badges
        fetchMyListings();
      }
    } catch (err) {
      // Could show a toast here in a future iteration
    }
  }

  // Helper: format a date nicely
  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Helper: pick a color for the listing's status badge
  function getStatusStyle(status) {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'claimed') return 'bg-yellow-100 text-yellow-700';
    if (status === 'completed') return 'bg-gray-100 text-gray-500';
    return '';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Click a listing to see incoming claims
            </p>
          </div>
          <Link
            to="/create-listing"
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            + New Listing
          </Link>
        </div>

        {/* Loading state */}
        {listingsLoading && (
          <p className="text-center text-gray-400 py-10">Loading your listings...</p>
        )}

        {/* Error state */}
        {!listingsLoading && errorMsg && (
          <p className="text-red-500 text-sm text-center py-10">{errorMsg}</p>
        )}

        {/* Empty state */}
        {!listingsLoading && !errorMsg && listings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-4xl mb-3">📦</p>
            <p className="text-gray-500 text-sm">You haven't posted anything yet.</p>
            <Link to="/create-listing" className="text-green-600 text-sm hover:underline mt-2 inline-block">
              Post your first listing →
            </Link>
          </div>
        )}

        {/* Listings and claims side by side */}
        {!listingsLoading && listings.length > 0 && (
          <div className="flex gap-4">
            {/* Left: listing cards */}
            <div className="flex flex-col gap-3 flex-1">
              {listings.map((listing) => (
                <button
                  key={listing.id}
                  onClick={() => fetchClaimsForListing(listing.id)}
                  className={`text-left bg-white border rounded-lg p-4 transition-all ${
                    selectedListingId === listing.id
                      ? 'border-green-400 ring-1 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 text-sm">{listing.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${getStatusStyle(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>

                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>{listing.quantity}</span>
                    <span>Expires {formatDate(listing.expiry_at)}</span>
                    {listing.pending_claim_count > 0 && (
                      <span className="text-orange-500 font-medium">
                        {listing.pending_claim_count} pending claim{listing.pending_claim_count !== '1' ? 's' : ''}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Right: claims panel for the selected listing */}
            {selectedListingId && (
              <div className="w-64 flex-shrink-0">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-gray-800 mb-3">Claims</h2>

                  {claimsLoading && (
                    <p className="text-xs text-gray-400">Loading claims...</p>
                  )}

                  {!claimsLoading && claims.length === 0 && (
                    <p className="text-xs text-gray-400">No claims yet for this listing.</p>
                  )}

                  {!claimsLoading && claims.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {claims.map((claim) => (
                        <div key={claim.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <p className="text-sm font-medium text-gray-800">{claim.seeker_name}</p>
                          <p className="text-xs text-gray-400">{claim.seeker_email}</p>

                          {/* Claim status and action buttons */}
                          {claim.status === 'pending' && (
                            <button
                              onClick={() => updateClaimStatus(claim.id, 'approved')}
                              className="mt-2 w-full text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {claim.status === 'approved' && (
                            <div className="mt-2 flex flex-col gap-1">
                              <p className="text-xs text-green-600 font-medium">✓ Approved</p>
                              <button
                                onClick={() => updateClaimStatus(claim.id, 'collected')}
                                className="w-full text-xs bg-gray-700 text-white py-1.5 rounded hover:bg-gray-800 transition-colors"
                              >
                                Mark Collected
                              </button>
                            </div>
                          )}

                          {claim.status === 'collected' && (
                            <p className="mt-2 text-xs text-gray-400">✓ Handover complete</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyListings;
