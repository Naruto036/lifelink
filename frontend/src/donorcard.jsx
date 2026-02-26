import React from "react";

export default function DonorCard({ donor }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-3 hover:bg-gray-700 cursor-pointer">
      <h2 className="text-white font-bold">{donor.name}</h2>
      <p className="text-red-500 font-semibold">{donor.blood}</p>
    </div>
  );
}