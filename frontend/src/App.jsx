import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import DonorRegistration from "./donorRegistration.jsx";
import SearchDonors from "./searchDonors.jsx";
import DonorDashboard from "../DonorDashboard.jsx";
import Home from "./Home.jsx";
import NotificationBell from "./Notification.jsx";

export default function App() {

  const userId = "donor123"; // later replace with real logged-in user

  

  return (
    <HashRouter>

      {/* 💎 PREMIUM NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg px-8 py-4 flex justify-between items-center sticky top-0 z-50">

        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-pink-500 bg-clip-text text-transparent"
        >
          LifeLink
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">

          <Link
            to="/"
            className="text-gray-700 hover:text-red-600 transition font-medium"
          >
            Home
          </Link>

          <Link
            to="/register"
            className="text-gray-700 hover:text-red-600 transition font-medium"
          >
            Register Donor
          </Link>

          <Link
            to="/search"
            className="text-gray-700 hover:text-red-600 transition font-medium"
          >
            Search Donors
          </Link>

          {/* 🔔 Notification Bell */}
          <NotificationBell userId={userId} />

        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/search" element={<SearchDonors />} />
        <Route path="/dashboard" element={<DonorDashboard />} />
      </Routes>

    </HashRouter>
  );
}