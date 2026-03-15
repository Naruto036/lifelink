import React, { useState } from "react";

export default function RegisterDonor() {
  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    phone: "",
    location: "",
    lat: "",
    lng: ""
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🔎 Fetch locations from OpenStreetMap
  const fetchLocations = async (value) => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingLocation(true);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
      );

      const data = await res.json();
      setSuggestions(data);
      setLoadingLocation(false);
    } catch (error) {
      console.error("Location fetch error:", error);
      setLoadingLocation(false);
    }
  };

  // 📍 Select location from dropdown
  const handleSelectLocation = (place) => {
    setForm({
      ...form,
      location: place.display_name,
      lat: place.lat,
      lng: place.lon
    });

    setSuggestions([]);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚀 Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.lat || !form.lng) {
      alert("Please select a valid location from suggestions");
      return;
    }

    try {
      setLoadingSubmit(true);

      const res = await fetch("http://localhost:5000/donors/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          bloodGroup: form.bloodGroup,
          phone: form.phone,
          location: {
            type: "Point",
            coordinates: [
              Number(form.lng),  // ⚠ IMPORTANT: longitude first
              Number(form.lat)   // latitude second
            ],
          address: form.location
          }
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Donor Registered Successfully!");

        setForm({
          name: "",
          bloodGroup: "",
          phone: "",
          location: "",
          lat: "",
          lng: ""
        });

        setSuggestions([]);
      } else {
        alert(data.message || "Error saving donor");
      }

      setLoadingSubmit(false);
    } catch (error) {
      console.error("Error saving donor:", error);
      alert("Server error. Check backend.");
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md relative">
        <h2 className="text-3xl font-extrabold text-red-600 text-center mb-8">
          Register as Donor
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-red-500"
            required
          />

          {/* Blood Group */}
          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="">Select Blood Group</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>O+</option>
            <option>O-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>

          {/* Location Autocomplete */}
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your location"
              value={form.location}
              onChange={(e) => {
                setForm({ ...form, location: e.target.value });
                fetchLocations(e.target.value);
              }}
              className="w-full p-4 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-red-500"
              required
            />

            {loadingLocation && (
              <div className="text-sm text-gray-500 mt-1">
                Searching location...
              </div>
            )}

            {suggestions.length > 0 && (
              <ul className="absolute w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg z-20">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectLocation(place)}
                    className="p-3 hover:bg-red-100 cursor-pointer text-gray-700 text-sm"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-red-500"
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold text-lg transition duration-300 shadow-md hover:shadow-xl disabled:opacity-60"
          >
            {loadingSubmit ? "Registering..." : "Register Now"}
          </button>

        </form>
      </div>
    </div>
  );
}