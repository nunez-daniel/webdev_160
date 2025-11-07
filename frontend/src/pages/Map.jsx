import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RobotTrackerMock = ({ updateInterval = 2000 }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Starting position for the robot
  const robotPosRef = useRef({ lat: 37.7749, lng: -122.4194 });

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [robotPosRef.current.lat, robotPosRef.current.lng],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
      }).addTo(mapInstanceRef.current);

      markerRef.current = L.marker([
        robotPosRef.current.lat,
        robotPosRef.current.lng,
      ]).addTo(mapInstanceRef.current);
    }

    // Mock robot movement
    const intervalId = setInterval(() => {
      // Move the robot randomly a little
      robotPosRef.current.lat += (Math.random() - 0.5) * 0.001;
      robotPosRef.current.lng += (Math.random() - 0.5) * 0.001;

      const { lat, lng } = robotPosRef.current;
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng]);
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [updateInterval]);

  return (
    <div className="flex flex-col items-start px-4 py-4">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ccc",
          marginTop: "20px",
        }}
      />
    </div>
  );
};

export default RobotTrackerMock;
