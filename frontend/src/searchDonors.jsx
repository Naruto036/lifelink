import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔄 Recenter map
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 13);
    }
  }, [coords, map]);
  return null;
}

export default function SearchDonors() {
  const userId = "69f45f63f011620cf1b15d3d";

  const [userLocation, setUserLocation] = useState(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState("");
  const [acceptedDonors, setAcceptedDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL="https://lifelink-4.onrender.com";

  // 📩 SEND REQUEST
  const sendRequest = async (donor) => {
    console.log("sending to donor",donor._id);
    try {
      
      const res = await fetch(
        "https://lifelink-4.onrender.com/api/requests/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donorId: donor._id,
            requesterId: userId,
            requesterName: "User",
            bloodGroup: donor.bloodGroup,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Request sent successfully ✅");
      } else {
        alert(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // 🗺️ Fix leaflet icons
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

  // 📍 GET LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setMessage("Please enable location")
    );
  }, []);

  // 🔁 LIVE ACCEPTED REQUESTS
  useEffect(() => {
    const fetchAccepted = async () => {
      try {
        const res = await fetch(
          `https://lifelink-4.onrender.com/api/requests/accepted/${userId}`
        );

        const data = await res.json();

        const ids = data.map((req) => req.donorId);
        setAcceptedDonors(ids);
      } catch (err) {
        console.error("Error fetching accepted:", err);
      }
    };

    fetchAccepted();
    const interval = setInterval(fetchAccepted, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔍 SEARCH DONORS
  const handleSearch = async () => {
    if (!bloodGroup) {
      setMessage("Please select blood group");
      return;
    }

    if (!userLocation) {
      setMessage("Location not ready...");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `https://lifelink-4.onrender.com/api/donors?lat=${userLocation.lat}&lng=${userLocation.lng}&bloodGroup=${encodeURIComponent(
          bloodGroup
        )}`
      );

      const data = await res.json();
      setDonors(data);

      if (data.length === 0) {
        setMessage(`No ${bloodGroup} donors found nearby.`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error fetching donors.");
    }

    setLoading(false);
  };

  // ⏳ LOADING SCREEN
  if (!userLocation) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-red-600 text-center mb-6">
        Find Blood Donors
      </h1>

      {/* SEARCH BOX (UPDATED UI) */}
      <div className="bg-white shadow rounded-xl p-5 max-w-2xl mx-auto mb-6 flex gap-3 items-center">

        <select
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          className="
            border-2 border-red-500
            bg-gradient-to-r from-white to-red-50
            p-3 rounded-lg w-full
            font-bold text-gray-900
            shadow-md
            focus:outline-none
            focus:ring-4 focus:ring-red-300
            transition
          "
        >
          <option value="">🩸 Select Blood Group</option>

          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
        >
          Search
        </button>
      </div>

      {message && (
        <p className="text-center text-red-500 mb-4">{message}</p>
      )}

      {/* MAIN */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* MAP */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap coords={userLocation} />

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
                  {donor.name} ({donor.bloodGroup})
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* DONOR LIST */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">

          {loading && (
            <p className="text-center text-gray-800 font-bold">
              Loading...
            </p>
          )}

          {donors.map((donor) => (
            <div
              key={donor._id}
              className="bg-white shadow p-5 rounded-xl flex justify-between items-center hover:shadow-xl transition"
            >
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {donor.name}
                </h2>
                <p className="text-red-600 font-semibold">
                  {donor.bloodGroup}
                </p>
              </div>

              <div>
                {acceptedDonors.includes(donor._id) ? (
                  <a
                    href={`tel:${donor.phone}`}
                    className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    Call Now
                  </a>
                ) : (
                  <button
                    onClick={() => sendRequest(donor)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                  >
                    Request
                  </button>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}