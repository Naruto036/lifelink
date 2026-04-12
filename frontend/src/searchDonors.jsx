import  { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import socket from "./socket";
import "leaflet/dist/leaflet.css";

// Helper component to move the map when location is found
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
  const [selectedBlood,setSelectedBlood]=useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState("");
  const [acceptedDonors, setAcceptedDonors] = useState([]);

  // Fix Leaflet marker icon paths
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

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
      console.error("Error getting location:", error);
    }
  );
}, []);

  // Socket Registration
  useEffect(() => {
    socket.emit("register", userId);
    
    socket.on("request_status_updated", (request) => {
      if (request.status === "Accepted") {
        setAcceptedDonors((prev) => [...prev, request.donorId]);
        alert("Your request was accepted!");
      } else if (request.status === "Rejected") {
        alert("Your request was rejected.");
      }
    });

    return () => socket.off("request_status_updated");
  }, []);

  // Get High Accuracy Location
  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const success = (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    };

    const error = (err) => {
      console.error("Location error:", err);
      setMessage("Please enable high-accuracy location/GPS.");
    };

    navigator.geolocation.getCurrentPosition(success, error, geoOptions);
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
      // CRITICAL: encodeURIComponent handles the '+' in blood groups like A+ or B+
      const bloodParam = encodeURIComponent(bloodGroup);
      const res = await fetch(
        `https://lifelink-3-nk8d.onrender.com/donors/all?lat=${userLocation.lat}&lng=${userLocation.lng}&bloodGroup=${bloodParam}`
      );

      const data = await res.json();
      setDonors(data);

      if (data.length === 0) {
        setMessage(`No ${bloodGroup} donors found nearby.`);
      } else {
        setMessage("");
      }
    } catch (error) {
      setMessage("Error fetching donors. Is the server running?");
    }
  };
const filteredDonors = donors.filter((donor) => {
  return donor.bloodGroup.toLowerCase() === selectedBlood.toLowerCase();
});
  const sendRequest = (donor) => {
    socket.emit("new_request", {
      donorId: donor._id,
      requesterId: userId,
    });
    alert(`Request sent to ${donor.name}!`);
  };

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-black text-lg font-semibold italic">
          Finding your precise location...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-red-700 tracking-wide">
          Find Blood Donors
        </h1>
        <p className="text-gray-600 mt-2">Verified donors in your immediate area</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-2xl mx-auto mb-8 border border-red-100">
        <select
          className="w-full border border-gray-300 p-4 rounded-xl text-black font-semibold mb-4 focus:ring-2 focus:ring-red-400 focus:outline-none bg-gray-50"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
        >
          <option value="">Select Blood Group</option>
          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="w-full bg-red-600 hover:bg-red-700 transition duration-300 text-white font-bold py-4 rounded-xl text-lg shadow-md"
        >
          Search Nearby
        </button>

        {message && <p className="text-center text-red-600 font-semibold mt-4">{message}</p>}
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-2 max-w-4xl mx-auto mb-10 overflow-hidden border border-gray-200">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap coords={userLocation} />

          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup><b>You are here</b></Popup>
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
                <div className="text-center">
                  <p className="font-bold">{donor.name}</p>
                  <p className="text-red-600">{donor.bloodGroup}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {donors.length > 0 && (
          <h2 className="text-2xl font-bold text-gray-800 mb-4 px-2">Results</h2>
        )}

        {donors.map((donor) => (
          <div
            key={donor._id}
            className="bg-white shadow-md rounded-2xl p-6 flex justify-between items-center border border-gray-100 hover:border-red-200 transition"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-900">{donor.name}</h3>
              <p className="text-gray-500 text-sm">
                Group: <span className="text-red-600 font-bold">{donor.bloodGroup}</span>
              </p>
            </div>

            <div>
              {acceptedDonors.includes(donor._id) ? (
                <a
                  href={`tel:${donor.phone}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition inline-block"
                >
                  Call Now
                </a>
              ) : (
                <button
                  onClick={() => sendRequest(donor)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
                >
                  Request Blood
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}