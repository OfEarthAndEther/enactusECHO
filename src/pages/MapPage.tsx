// src/components/Map.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue in Leaflet + React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPage: React.FC = () => {
  return (
    <div className="w-full h-[500px]">
      <MapContainer
        center={[28.61173966254568, 77.0369307540514]} // Default center: Student Centre
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg shadow-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[28.613204342915626, 77.03365839281985]}>
          <Popup>North gate</Popup>
        </Marker>
        <Marker position={[28.61008378503705, 77.03802639739708]}>
          <Popup>Central Fountain</Popup>
        </Marker>
        <Marker position={[28.611736372421603, 77.03690370487784]}>
          <Popup>Student Centre</Popup>
        </Marker>
        <Marker position={[28.60723063814386, 77.03663823823983]}>
          <Popup>Faculty Quarters</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPage;
