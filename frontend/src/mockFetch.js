// mockFetch.js — fake backend responses for frontend-only development
// This file intercepts all fetch() calls to /api/* and returns hardcoded data
// It is ONLY active when VITE_MOCK=true in .env.local

// Some fake users we pretend exist
var fakeDonorUser = { id: 1, name: 'Ananya Donor', email: 'donor@test.com', role: 'donor' };
var fakeSeekerUser = { id: 2, name: 'Rohan Seeker', email: 'seeker@test.com', role: 'seeker' };

// Some fake food listings for the seeker feed
var fakeListings = [
  {
    id: 1,
    donor_id: 1,
    donor_name: 'Ananya Donor',
    title: 'Dal Makhani + Rice (5 portions)',
    category: 'homemade',
    quantity: '5 meals',
    description: 'Freshly cooked this morning. Veg, no onion/garlic.',
    expiry_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // expires in 3 hrs
    lat: 12.9716,
    lng: 77.5946,
    status: 'active',
    distance_km: '1.2',
  },
  {
    id: 2,
    donor_id: 1,
    donor_name: 'Ananya Donor',
    title: 'Unopened Lays & Biscuit Packets',
    category: 'packaged',
    quantity: '20 packets',
    description: 'Surplus from an office event. Best before date is next month.',
    expiry_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // expires in 30 days
    lat: 12.975,
    lng: 77.61,
    status: 'active',
    distance_km: '2.8',
  },
  {
    id: 3,
    donor_id: 1,
    donor_name: 'Ananya Donor',
    title: 'Chapati + Sabzi (leftover dinner)',
    category: 'homemade',
    quantity: '3 portions',
    description: 'Mixed veg sabzi. Made last night, still good.',
    expiry_at: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // expires in 1.5 hrs — urgent!
    lat: 12.968,
    lng: 77.595,
    status: 'active',
    distance_km: '0.5',
  },
];

// Fake listings for the donor's "My Listings" page
var fakeMyListings = [
  {
    id: 1,
    title: 'Dal Makhani + Rice (5 portions)',
    category: 'homemade',
    quantity: '5 meals',
    expiry_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    pending_claim_count: '2',
  },
  {
    id: 2,
    title: 'Unopened Lays & Biscuit Packets',
    category: 'packaged',
    quantity: '20 packets',
    expiry_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'claimed',
    pending_claim_count: '0',
  },
  {
    id: 3,
    title: 'Chapati + Sabzi (leftover dinner)',
    category: 'homemade',
    quantity: '3 portions',
    expiry_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    pending_claim_count: '0',
  },
];

// Fake claims to show in the donor's claims panel
var fakeClaims = [
  { id: 10, listing_id: 1, seeker_id: 2, seeker_name: 'Rohan Seeker', seeker_email: 'rohan@test.com', status: 'pending' },
  { id: 11, listing_id: 1, seeker_id: 3, seeker_name: 'Priya NGO', seeker_email: 'priya@ngo.org', status: 'approved' },
];

// This is the mock version of fetch() — it matches URLs and returns fake data
function mockFetch(url, options) {
  var method = (options && options.method) ? options.method.toUpperCase() : 'GET';

  // Small delay to simulate network so loading states are visible
  var delay = 400;

  return new Promise(function(resolve) {
    setTimeout(function() {
      var responseData = null;

      // ── Auth routes ──────────────────────────────────────────────────────────
      if (url.includes('/api/auth/login') || url.includes('/api/auth/signup')) {
        // Figure out which role the user picked from the request body
        var body = options && options.body ? JSON.parse(options.body) : {};
        var user = body.role === 'donor' ? fakeDonorUser : fakeSeekerUser;

        // If no role in body (login), default to seeker
        if (!body.role) {
          user = fakeSeekerUser;
        }

        responseData = { token: 'mock-jwt-token-abc123', user: user };
      }

      // ── Get all active listings (seeker feed) ────────────────────────────────
      else if (url.includes('/api/listings/mine')) {
        responseData = { listings: fakeMyListings };
      }

      else if (url.includes('/api/listings')) {
        responseData = { listings: fakeListings };
      }

      // ── Claims ───────────────────────────────────────────────────────────────
      else if (url.includes('/api/claims/listing/')) {
        responseData = { claims: fakeClaims };
      }

      else if (url.includes('/api/claims') && method === 'POST') {
        responseData = { message: 'Claim submitted!', claim: { id: 99, status: 'pending' } };
      }

      else if (url.includes('/api/claims/') && method === 'PATCH') {
        responseData = { message: 'Status updated.' };
      }

      // ── Fallback for unknown routes ──────────────────────────────────────────
      else {
        responseData = { message: 'Mock: route not found' };
      }

      // Simulate a successful HTTP 200 response
      resolve({
        ok: true,
        status: 200,
        json: function() { return Promise.resolve(responseData); },
      });
    }, delay);
  });
}

// Install the mock by replacing the global fetch
export function installMockFetch() {
  window.fetch = mockFetch;
  console.log('%c[Mock Mode] Fake API is active — no backend needed', 'color: orange; font-weight: bold');
}
