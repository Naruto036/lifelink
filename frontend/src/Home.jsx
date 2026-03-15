import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {

  const [donors, setDonors] = useState(0);

  // Animated counter effect
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 10;
      if (count >= 500) {
        count = 500;
        clearInterval(interval);
      }
      setDonors(count);
    }, 20);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-6 bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <h1 className="text-3xl font-extrabold text-red-600 tracking-wide">
          LifeLink
        </h1>

        <div className="space-x-8 font-semibold text-gray-700">
          <Link to="/" className="hover:text-red-600 transition">Home</Link>
          <Link to="/register" className="hover:text-red-600 transition">Register</Link>
          <Link to="/search" className="hover:text-red-600 transition">Search</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 relative">

        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-12 max-w-4xl">

          <h2 className="text-6xl font-extrabold text-gray-900 leading-tight">
            Saving Lives  
            <span className="text-red-600"> One Drop at a Time</span>
          </h2>

          <p className="text-gray-600 text-xl mt-6">
            A real-time blood donation platform connecting donors and patients instantly.
          </p>

          <div className="mt-10 flex justify-center gap-6">

            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-lg hover:scale-105 transition duration-300"
            >
              Become a Donor
            </Link>

            <Link
              to="/search"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-10 py-4 rounded-2xl text-lg font-bold transition duration-300"
            >
              Find Donors
            </Link>

          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-10 bg-white">
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">

          <div className="p-10 bg-red-50 rounded-3xl shadow-xl">
            <h3 className="text-5xl font-extrabold text-red-600">{donors}+</h3>
            <p className="mt-4 text-gray-700 font-semibold text-lg">Registered Donors</p>
          </div>

          <div className="p-10 bg-red-50 rounded-3xl shadow-xl">
            <h3 className="text-5xl font-extrabold text-red-600">24/7</h3>
            <p className="mt-4 text-gray-700 font-semibold text-lg">Emergency Support</p>
          </div>

          <div className="p-10 bg-red-50 rounded-3xl shadow-xl">
            <h3 className="text-5xl font-extrabold text-red-600">100%</h3>
            <p className="mt-4 text-gray-700 font-semibold text-lg">Verified Platform</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gradient-to-r from-red-50 to-white text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">

          <div className="bg-white shadow-xl rounded-3xl p-8 hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-red-600">1. Register</h3>
            <p className="text-gray-600 mt-4">
              Donors register with blood group and location.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-3xl p-8 hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-red-600">2. Search</h3>
            <p className="text-gray-600 mt-4">
              Patients search nearby donors using live map.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-3xl p-8 hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-red-600">3. Connect</h3>
            <p className="text-gray-600 mt-4">
              Send request and connect instantly after acceptance.
            </p>
          </div>

        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12">What People Say</h2>

        <div className="max-w-4xl mx-auto space-y-8 px-6">

          <div className="bg-red-50 p-8 rounded-3xl shadow-lg">
            <p className="text-gray-700 italic">
              “LifeLink helped me find a donor within 15 minutes during an emergency.”
            </p>
            <h4 className="mt-4 font-bold text-red-600">– Patient User</h4>
          </div>

          <div className="bg-red-50 p-8 rounded-3xl shadow-lg">
            <p className="text-gray-700 italic">
              “This platform makes donating blood easier and more meaningful.”
            </p>
            <h4 className="mt-4 font-bold text-red-600">– Registered Donor</h4>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <h3 className="text-2xl font-bold text-red-500">LifeLink</h3>
        <p className="mt-4 text-gray-400">
          Connecting humanity through technology.
        </p>
        <p className="mt-6 text-gray-500 text-sm">
          © 2026 LifeLink. All rights reserved.
        </p>
      </footer>

    </div>
  );
}