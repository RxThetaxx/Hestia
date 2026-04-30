<div align="center">

<br/>

```
 🥗  HESTIA
```

**Bridge the gap between surplus food and those who need it most.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232A)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white&labelColor=1a1a1a)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white&labelColor=1a1a1a)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br/>

> *Every day, tonnes of edible food are wasted while people nearby go hungry.*
> *This platform fixes that — in real time.*

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Screenshots](#-screenshots) · [Contributing](#-contributing)

<br/>

</div>

---

## 🌱 What is this?

**Hestia** is a full-stack web application built as a capstone project for a Web Application Programming course. Named after the Greek goddess of the hearth and home, it connects **food donors** (restaurants, households, canteens) with **claimants** (NGOs, individuals, food banks) to rescue surplus food before it goes to waste.

Users can post real-time food listings with location, quantity, and expiry windows. Claimants browse, reserve, and coordinate pickups — all tracked on a live impact dashboard showing meals saved and CO₂ avoided.

---

## ✨ Features

### 🧑‍🍳 For Donors
- Post surplus food listings with photo, quantity, expiry time, and pickup address
- Real-time status updates — see when a listing is reserved or picked up
- Personal dashboard with listing history and impact stats

### 🤝 For Claimants
- Browse live food listings on a card view or interactive map
- Filter by food type, distance, and availability
- Reserve a listing (30-minute lock) and coordinate pickup details

### 🛡️ For Admins
- Moderate and approve incoming listings before they go live
- Manage users and resolve disputes
- View platform-wide analytics — kg rescued, claims per week, top donors

### 📊 Impact Dashboard *(public)*
- Live counters: meals served, kilograms rescued, CO₂ avoided
- Leaderboard of top contributing donor organizations
- Weekly trend charts powered by Recharts

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Tailwind CSS |
| **State** | Context API + `useReducer` |
| **Backend** | Node.js, Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcrypt (role-based) |
| **Real-time** | Socket.io |
| **Maps** | Leaflet + React-Leaflet |
| **Charts** | Recharts |
| **File Uploads** | Multer |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/hestia.git
cd hestia

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies
cd ../client && npm install
```

### Environment Setup

Create a `.env` file inside `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### Running the App

```bash
# Start the backend server
cd server && npm run dev

# In a new terminal — start the frontend
cd client && npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
hestia/
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ListingCard/
│   │   │   ├── MapView/
│   │   │   ├── Navbar/
│   │   │   └── ReservationTimer/
│   │   ├── context/            # Auth + listings context
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── ClaimantDashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── ImpactBoard.jsx
│   │   ├── routes/             # PrivateRoute, RoleRoute
│   │   └── utils/              # API helpers, formatters
│   └── public/
│
└── server/                     # Node.js + Express backend
    ├── controllers/
    │   ├── authController.js
    │   ├── listingController.js
    │   └── impactController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    ├── models/
    │   ├── User.js
    │   ├── Listing.js
    │   └── Claim.js
    ├── routes/
    │   ├── auth.js
    │   ├── listings.js
    │   └── admin.js
    └── socket/
        └── listingSocket.js    # Real-time reservation events
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| `donor` | Post listings, manage own listings, view impact |
| `claimant` | Browse listings, reserve, coordinate pickups |
| `admin` | Approve/reject listings, manage users, view analytics |

Role is selected at registration and encoded in the JWT. Route guards enforce access on both client and server.

---

## ⏱ Reservation Lock

When a claimant reserves a listing, it is **locked for 30 minutes**. If pickup is not confirmed within that window, the listing is automatically released back to the pool. This is handled via:

- A `reservedUntil` timestamp on the `Listing` model
- A Socket.io event that broadcasts the release to all connected clients
- A countdown timer component in React that reflects the remaining lock time live

---

## 📸 Screenshots

> NA

---

## 🤝 Contributing

This is a capstone project — but contributions, suggestions, and feedback are welcome.

```bash
# Fork the repo, create a branch, and open a PR
git checkout -b feature/your-feature-name
```

Please follow the existing code style and include a brief description in your PR.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with 💚 by Hestia — keeping the hearth warm, one meal at a time.

</div>
