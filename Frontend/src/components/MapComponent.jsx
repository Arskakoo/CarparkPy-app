import React, { useEffect } from "react";
import { slpy } from "slpy";
import "maplibre-gl/dist/maplibre-gl.css";
import "slpy/dist/css/slpy-style.css";
const keysecret = import.meta.env.VITE_API_KEY;

const MapComponent = ({ location }) => {
  useEffect(() => {
    const apiKey = keysecret;
    const targetDivId = "map";
    const country = "Finland";
    const latitude = "38.0";
    const longitude = "-100.0";
    const startZoom = 20;

    const center = [longitude, latitude];
    const map = new slpy.maplibreMap({
      apiKey: apiKey,
      container: targetDivId, 
      center: center,
      zoom: startZoom,
      mapStyle: "3d",
      pitch: 60,
      pitchWithRotate: true,
    });

    let markers = [];
    map.on("load", async function () {
      const search = location;

      try {
        const response = await fetch(
          `https://api.slpy.com/v1/search?country=${country}&key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ query: search }),
          }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const obj = await response.json();

        if (obj.lat && obj.lon) {
          // Remove any existing markers before adding new ones

          markers = [{ data: [obj.lat, obj.lon] }];

          // Add the new marker to the map
          slpy.addMarkers(markers, map);

          // Fly the map to the new location
          slpy.flyTo(obj, map);
        } else {
          alert(
            "Location not found. Please check your spelling and try again."
          );
        }
      } catch (error) {
        console.error("Fetch error: ", error);
        alert(
          "There was an error processing your request. Please try again later."
        );
      }
    });
  }, [location]);

  return (
    <div
      id="map"
      style={{ width: "100%", height: "550px", filter: "saturate(1.5)" }}
    />
  );
};

export default MapComponent;
