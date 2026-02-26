import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import DonorRegistration from './donorRegistration.jsx'
import SearchDonors from './searchDonors.jsx'
import socket from "./socket";
import DonorDashboard from "../DonorDashboard.jsx";

// Homepage component
function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-extrabold text-red-600 mb-2">LifeLink</h1>
      <p className="text-gray-600 text-lg mb-8">
        Connect blood donors with those in need
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/donor-registration"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold text-lg"
        >
          Register as Donor
        </Link>
        <Link
          to="/search"
          className="bg-white border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition font-semibold text-lg"
        >
          Search Donors
        </Link>
      </div>
    </div>
  )
}

export default function App() {

  // ✅ MOVE useEffect INSIDE App
  useEffect(() => {
    const userId = "USER_ID_FROM_DATABASE"; 
    socket.emit("register", userId);
  }, []);

  return (
    <HashRouter>
      <nav className="bg-white border-b border-gray-200 shadow px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-red-600">
          LifeLink
        </Link>
        <div className="flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-red-600 transition font-medium">
            Home
          </Link>
          <Link to="/donor-registration" className="text-gray-700 hover:text-red-600 transition font-medium">
            Register Donor
          </Link>
          <Link to="/search" className="text-gray-700 hover:text-red-600 transition font-medium">
            Search Donors
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor-registration" element={<DonorRegistration />} />
        <Route path="/search" element={<SearchDonors/>}/>
        <Route path='/dashboard' element={<DonorDashboard/>}/>
      </Routes>
    </HashRouter>
  )
}