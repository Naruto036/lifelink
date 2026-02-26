import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import socket from "./socket";
import "leaflet/dist/leaflet.css";

export default function SearchDonors() {
  const [userLocation, setUserLocation] = useState(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState("");

  // Fix leaflet icon issue (run once)
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

  // Ask for user location
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

  // Listen for request accepted
  useEffect(() => {
    socket.on("request_accepted", (data) => {
      alert("Request Accepted! Call: " + data.donorPhone);
    });

    return () => {
      socket.off("request_accepted");
    };
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
    socket.emit("send_request", {
      donorId: donor._id,
      requesterId: "USER123", // temporary
      donorPhone: donor.phone,
    });

    alert("Request sent to donor!");
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
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">
        Search Donors Nearby
      </h2>

      {/* Blood Group Dropdown */}
      <div className="max-w-xl mx-auto mb-6">
        <select
          className="w-full border-2 border-gray-300 p-3 rounded-lg text-black font-semibold mb-4"
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
          className="w-full bg-red-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-red-700"
        >
          Search
        </button>
      </div>

      {message && (
        <p className="text-center text-lg font-semibold text-black mb-4">
          {message}
        </p>
      )}

      {/* Map */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* User Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Donor Markers */}
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

      {/* Donor List */}
      {donors.length > 0 && (
        <div className="mt-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-black">
            Available Donors
          </h3>

          {donors.map((donor) => (
            <div
              key={donor._id}
              className="border p-4 rounded-lg mb-3 shadow"
            >
              <p className="font-semibold text-black">
                Name: {donor.name}
              </p>
              <p className="text-black">
                Blood Group: {donor.bloodGroup}
              </p>

              <button
                onClick={() => sendRequest(donor)}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}