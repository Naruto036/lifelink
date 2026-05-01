import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [donorCount, setDonorCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch("https://lifelink-4.onrender.com/api/donors");
        const data = await res.json();
        setDonorCount(data.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDonors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center py-20 px-4"
      >
        <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-3xl">

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Saving Lives <span className="text-red-600">One Drop at a Time</span>
          </h1>

          <p className="text-gray-700 mt-4 text-lg font-medium">
            Connect instantly with nearby blood donors in real-time.
          </p>

          <div className="flex gap-4 justify-center mt-6 flex-wrap">

            {/* ✅ FIXED BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/donor")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
            >
              Become a Donor
            </motion.button>

            {/* ✅ FIXED BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/search")}
              className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-semibold"
            >
              Find Donors
            </motion.button>

          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-16">

        {/* Donors */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-lg rounded-2xl p-6 text-center"
        >
          <Users className="mx-auto text-red-600 mb-2" size={40} />
          <h2 className="text-3xl font-bold text-red-600">{donorCount}+</h2>
          <p className="text-gray-700 mt-2 font-medium">Registered Donors</p>
        </motion.div>

        {/* Requests */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-lg rounded-2xl p-6 text-center"
        >
          <Activity className="mx-auto text-green-600 mb-2" size={40} />
          <h2 className="text-3xl font-bold text-green-600">Live</h2>
          <p className="text-gray-700 mt-2 font-medium">Active Requests</p>
        </motion.div>

        {/* Availability */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-lg rounded-2xl p-6 text-center"
        >
          <Clock className="mx-auto text-blue-600 mb-2" size={40} />
          <h2 className="text-3xl font-bold text-blue-600">24/7</h2>
          <p className="text-gray-700 mt-2 font-medium">Availability</p>
        </motion.div>

      </div>

    </div>
  );
}