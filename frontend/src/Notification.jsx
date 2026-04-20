import React, { useState } from "react";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // ❌ No socket, so no real-time push
  // You will need API polling later if needed

  const acceptRequest = (request) => {
    // If you still have backend endpoint, call API instead of socket
    console.log("Accepted request:", request);

    setNotifications((prev) =>
      prev.filter((n) => n !== request)
    );
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        onClick={() => setOpen(!open)}
        className="relative cursor-pointer text-2xl"
      >
        🔔

        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>

      {open && (
        <div className="mt-3 w-80 bg-white shadow-2xl rounded-2xl p-4">
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
                className="mt-2 w-full bg-green-600 text-white py-1 rounded-lg"
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