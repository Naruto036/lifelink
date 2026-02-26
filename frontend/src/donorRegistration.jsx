import React, { useState } from "react";

export default function DonorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "",
    phone: "",
  });

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState("");

  const handleLocationSearch = async (value) => {
    setLocationQuery(value);

    if (value.length < 3) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
    );
    const data = await response.json();
    setSuggestions(data);
  };

  const handleSelectLocation = (place) => {
    setSelectedLocation(place);
    setLocationQuery(place.display_name);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      setMessage("Please select location from suggestions");
      return;
    }

    const donorData = {
      ...formData,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(selectedLocation.lon),
          parseFloat(selectedLocation.lat),
        ],
        address: selectedLocation.display_name,
      },
    };

    try {
      const res = await fetch("http://localhost:5000/donors/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donorData),
      });

      if (res.ok) {
        setMessage("Donor registered successfully!");
        setFormData({ name: "", bloodGroup: "", phone: "" });
        setLocationQuery("");
        setSelectedLocation(null);
      } else {
        setMessage("Error registering donor");
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-200">
        
        <h2 className="text-3xl font-extrabold text-red-700 mb-6 text-center">
          Donor Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            placeholder="Enter Full Name"
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-black font-semibold focus:outline-none focus:border-red-600"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <select
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-black font-semibold focus:outline-none focus:border-red-600"
            value={formData.bloodGroup}
            onChange={(e) =>
              setFormData({ ...formData, bloodGroup: e.target.value })
            }
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

          <input
            type="text"
            placeholder="Enter Phone Number"
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-black font-semibold focus:outline-none focus:border-red-600"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          {/* Location Autocomplete */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Location"
              className="w-full border-2 border-gray-300 p-3 rounded-lg text-black font-semibold focus:outline-none focus:border-red-600"
              value={locationQuery}
              onChange={(e) => handleLocationSearch(e.target.value)}
              required
            />

            {suggestions.length > 0 && (
              <ul className="absolute bg-white border-2 border-gray-300 w-full max-h-48 overflow-y-auto rounded-lg shadow-xl z-20">
                {suggestions.map((place) => (
                  <li
                    key={place.place_id}
                    className="p-3 hover:bg-red-50 cursor-pointer text-black font-medium"
                    onClick={() => handleSelectLocation(place)}
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded-lg text-lg font-bold hover:bg-red-700 transition"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-600 font-semibold text-lg">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}