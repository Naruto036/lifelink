import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://lifelink-3-nk8d.onrender.com/");

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.emit("register", userId);

    socket.on("receive_request", (data) => {
      setNotifications((prev) => [...prev, data]);
    });

    socket.on("request_accepted", (data) => {
      alert("Your blood request was accepted!");
    });

    return () => {
      socket.off("receive_request");
      socket.off("request_accepted");
    };
  }, [userId]);

  const acceptRequest = (request) => {
    socket.emit("accept_request", {
      requesterId: request.requesterId,
      donorId: userId,
    });

    setNotifications((prev) =>
      prev.filter((n) => n !== request)
    );
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        onClick={() => setOpen(!open)}
        className="relative cursor-pointer"
      >
        
        {notifications.length > 0 && (
          <span className="text-2xl hover:scale-110 transition cursor-pointer">
            {notifications.length}
          </span>
        )}
      </div>

      {open && (
        <div className="mt-3 w-80 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-4 animate-fadeIn border border-gray-100">
          <h3 className="font-bold mb-2 text-red-600">
            Blood Requests
          </h3>

          {notifications.length === 0 && (
            <p className="text-gray-500 text-sm">
              No new requests
            </p>
          )}

          {notifications.map((req, index) => (
            <div
              key={index}
              className="bg-gray-100 p-3 rounded-xl mb-3"
            >
              <p className="text-sm">
                Blood Group: <b>{req.bloodGroup}</b>
              </p>
              <p className="text-sm">
                Location: {req.location}
              </p>

              <button
                onClick={() => acceptRequest(req)}
                className="mt-2 w-full bg-green-600 text-white py-1 rounded-lg hover:bg-green-700"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}