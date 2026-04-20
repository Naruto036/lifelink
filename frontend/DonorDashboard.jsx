import React, { useEffect, useState } from "react";

export default function DonorDashboard() {
  const donorId = "YOUR_REAL_DONOR_ID"; // replace properly later
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`http://lifelink-4.onrender.com/api/requests/donor${donorId}`)
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, []);

  const updateStatus = async (requestId, status) => {
    await fetch(`https://lifelink-4.onrender.com/api/requests/update/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-bold text-red-700 mb-6">
        Incoming Requests
      </h2>

      {requests.length === 0 && <p>No requests</p>}

      {requests.map((req) => (
        <div key={req._id} className="border p-4 mb-4 rounded shadow">
          <p>Status: {req.status}</p>

          {req.status === "Pending" && (
            <>
              <button
                onClick={() => updateStatus(req._id, "Accepted")}
                className="bg-green-600 text-white px-4 py-2 mr-2 rounded"
              >
                Accept
              </button>

              <button
                onClick={() => updateStatus(req._id, "Rejected")}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}