import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function DonorMap({ donors }) {
  return (
    <MapContainer
      center={[37.7749, -122.4194]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {donors.map((donor) => (
        <Marker key={donor.id} position={[donor.lat, donor.lng]}>
          <Popup>
            {donor.name} - {donor.blood}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}