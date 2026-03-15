import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import socket from "./socket";
import "leaflet/dist/leaflet.css";

export default function SearchDonors() {
  const userId = "USER123"; // temporary (replace later with login)

  const [userLocation, setUserLocation] = useState(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState("");
  const [acceptedDonors, setAcceptedDonors] = useState([]);

  // Fix Leaflet marker issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  // Register socket user
  useEffect(() => {
    socket.emit("register", userId);
  }, []);

  // Listen for request status updates
  useEffect(() => {
    socket.on("request_status_updated", (request) => {
      if (request.status === "Accepted") {
        setAcceptedDonors((prev) => [...prev, request.donorId]);
        alert("Your request was accepted!");
      }

      if (request.status === "Rejected") {
        alert("Your request was rejected.");
      }
    });

    return () => {
      socket.off("request_status_updated");
    };
  }, []);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setMessage("Please allow location access.");
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!bloodGroup) {
      setMessage("Please select blood group");
      return;
    }

    if (!userLocation) {
      setMessage("Location not available");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/donors/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&bloodGroup=${bloodGroup}`
      );

      const data = await res.json();
      setDonors(data);

      if (data.length === 0) {
        setMessage("No donors found nearby.");
      } else {
        setMessage("");
      }
    } catch (error) {
      setMessage("Error fetching donors.");
    }
  };

  const sendRequest = (donor) => {
    socket.emit("new_request", {
      donorId: donor._id,
      requesterId: userId,
    });

    alert("Request sent! Waiting for donor response.");
  };

  // Prevent map crash if location not ready
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <p className="text-black text-lg font-semibold">
          Allow location to search nearby donors...
        </p>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">

    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-4xl font-extrabold text-red-700 tracking-wide">
        Find Blood Donors Near You
      </h1>
      <p className="text-gray-600 mt-2">
        Search verified donors in your area instantly
      </p>
    </div>

    {/* Search Card */}
    <div className="bg-white shadow-xl rounded-2xl p-6 max-w-2xl mx-auto mb-8">

      <select
        className="w-full border border-gray-300 p-4 rounded-xl text-black font-semibold mb-4 focus:ring-2 focus:ring-red-400 focus:outline-none"
        value={bloodGroup}
        onChange={(e) => setBloodGroup(e.target.value)}
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

      <button
        onClick={handleSearch}
        className="w-full bg-red-600 hover:bg-red-700 transition duration-300 text-white font-bold py-4 rounded-xl text-lg shadow-md"
      >
        Search Donors
      </button>

      {message && (
        <p className="text-center text-red-600 font-semibold mt-4">
          {message}
        </p>
      )}
    </div>

    {/* Map Section */}
    <div className="bg-white shadow-xl rounded-2xl p-4 max-w-4xl mx-auto mb-10">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        className="rounded-xl"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>

        {donors.map((donor) => (
          <Marker
            key={donor._id}
            position={[
              donor.location.coordinates[1],
              donor.location.coordinates[0],
            ]}
          >
            <Popup>
              {donor.name} - {donor.bloodGroup}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>

    {/* Donor Cards */}
    <div className="max-w-4xl mx-auto space-y-6">

      {donors.length > 0 && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Available Donors
        </h2>
      )}

      {donors.map((donor) => (
        <div
          key={donor._id}
          className="bg-white shadow-lg rounded-2xl p-6 flex justify-between items-center hover:shadow-2xl transition duration-300"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {donor.name}
            </h3>
            <p className="text-gray-600">
              Blood Group:
              <span className="ml-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                {donor.bloodGroup}
              </span>
            </p>
          </div>

          <div>
            {acceptedDonors.includes(donor._id) ? (
              <a
                href={`tel:${donor.phone}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
              >
                Call Donor
              </a>
            ) : (
              <button
                onClick={() => sendRequest(donor)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
              >
                Send Request
              </button>
            )}
          </div>
        </div>
      ))}

    </div>
  </div>
);
}