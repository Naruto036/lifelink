import { useEffect, useState } from "react";

export default function DonorDashboard() {
  const donorId = "67f1c9a8b23e4d001234abcd";
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`https://lifelink-4.onrender.com/api/requests/donor/${donorId}`)
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(
      `https://lifelink-4.onrender.com/api/requests/update/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-extrabold text-red-700 mb-6 text-center">
        Donor Dashboard
      </h1>

      {requests.length === 0 && (
        <p className="text-center text-gray-800 font-semibold">
          No requests yet
        </p>
      )}

      <div className="max-w-3xl mx-auto space-y-4">

        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-white shadow-lg p-5 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="text-gray-900 font-bold text-lg">
                Request ID: {req._id}
              </p>
              <p className="text-gray-700 font-semibold">
                Status:{" "}
                <span
                  className={
                    req.status === "Accepted"
                      ? "text-green-600"
                      : req.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {req.status}
                </span>
              </p>
            </div>

            {req.status === "Pending" && (
              <div className="space-x-2">
                <button
                  onClick={() => updateStatus(req._id, "Accepted")}
                  className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Accept
                </button>

                <button
                  onClick={() => updateStatus(req._id, "Rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}