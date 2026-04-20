import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper component
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
  const userId = "USER123";

  const [userLocation, setUserLocation] = useState(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState("");
  const [acceptedDonors, setAcceptedDonors] = useState([]);

  // ✅ FIXED: sendRequest OUTSIDE useEffect
  const sendRequest = async (donor) => {
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

  // Fix Leaflet icons
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

  // Get location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        console.log("User Location:", position.coords);
      },
      (error) => {
        console.error("Location error:", error);
        setMessage("Please enable location.");
      }
    );
  }, []);
  useEffect(() => {
  const fetchAccepted = async () => {
    try {
      const res = await fetch(
        `https://lifelink-4.onrender.com/api/requests/accepted/${userId}`
      );

      const data = await res.json();

      // store donorIds
      const acceptedIds = data.map((req) => req.donorId);
      setAcceptedDonors(acceptedIds);

    } catch (err) {
      console.error("Error fetching accepted:", err);
    }
  };

  fetchAccepted();
}, []);

  const handleSearch = async () => {
    if (!bloodGroup) {
      setMessage("Please select blood group");
      return;
    }

    if (!userLocation) {
      setMessage("Location not available yet...");
      return;
    }

    try {
      const bloodParam = encodeURIComponent(bloodGroup);

      const res = await fetch(
        `https://lifelink-4.onrender.com/api/donors?lat=${userLocation.lat}&lng=${userLocation.lng}&bloodGroup=${bloodParam}`
      );

      const data = await res.json();
      setDonors(data);

      if (data.length === 0) {
        setMessage(`No ${bloodGroup} donors found nearby.`);
      } else {
        setMessage("");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error fetching donors.");
    }
  };

  if (!userLocation) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Find Donors</h1>

      <select
        value={bloodGroup}
        onChange={(e) => setBloodGroup(e.target.value)}
        className="border p-2 mb-3"
      >
        <option value="">Select Blood Group</option>
        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
          <option key={bg} value={bg}>
            {bg}
          </option>
        ))}
      </select>

      <button
        onClick={handleSearch}
        className="bg-red-600 text-white px-4 py-2 ml-2"
      >
        Search
      </button>

      <p className="text-red-500 mt-2">{message}</p>

      {/* MAP */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "300px", marginTop: "20px" }}
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
            <Popup>{donor.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* RESULTS */}
      {donors.map((donor) => (
        <div key={donor._id} className="border p-3 mt-3">
          <p>{donor.name}</p>
          <p>{donor.bloodGroup}</p>

          <button
            onClick={() => sendRequest(donor)}
            className="bg-red-500 text-white px-3 py-1 mt-2"
          >
            Request Blood
          </button>
        </div>
      ))}
    </div>
  );
}