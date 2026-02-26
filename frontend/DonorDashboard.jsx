import React, { useEffect, useState } from "react";
import socket from "./socket";

export default function DonorDashboard() {
  const [request, setRequest] = useState(null);

  const donorId = "DONOR123"; // later replace with login system

  useEffect(() => {
    socket.emit("register", donorId);

    socket.on("receive_request", (data) => {
      setRequest(data);
    });

    return () => {
      socket.off("receive_request");
    };
  }, []);

  const acceptRequest = () => {
    socket.emit("accept_request", {
      requesterId: request.requesterId,
      donorPhone: request.donorPhone,
    });

    setRequest(null);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">

      <div className="bg-white shadow-xl p-8 rounded-xl">

        <h2 className="text-2xl font-bold text-red-700 mb-4">
          Donor Dashboard
        </h2>

        {request ? (
          <div>
            <p className="text-black font-semibold mb-4">
              Someone needs your blood.
            </p>

            <button
              onClick={acceptRequest}
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              Accept
            </button>

            <button
              onClick={() => setRequest(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        ) : (
          <p className="text-black">No incoming requests</p>
        )}

      </div>
    </div>
  );
}