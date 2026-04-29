import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";

import Home from "./Home";
import SearchDonors from "./searchDonors";
import DonorRegistration from "./donorRegistration";
import DonorDashboard from "./DonorDashboard";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchDonors />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/dashboard" element={<DonorDashboard />} />
      </Routes>
    </>
  );
}