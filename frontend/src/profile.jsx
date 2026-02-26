import { useState } from "react";
import axios from "axios";

function Profile({ donor }) {
  const [isActive, setIsActive] = useState(donor.isActive);

  const toggleStatus = async () => {
    const res = await axios.patch(
      `http://localhost:5000/donor/${donor._id}/toggle-status`
    );

    setIsActive(res.data.isActive);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">My Profile</h2>

      <p className="text-lg font-semibold">{donor.name}</p>
      <p>Blood Group: {donor.bloodGroup}</p>

      <button
        onClick={toggleStatus}
        className={`mt-4 px-6 py-2 rounded text-white ${
          isActive ? "bg-green-600" : "bg-gray-500"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </button>
    </div>
  );
}

export default Profile;