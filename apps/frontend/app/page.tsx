import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid";

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      center: [51.5, -0.12],
      zoom: 10,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const vectorTileLayer = (L as any).vectorGrid.protobuf(
      "http://localhost:8080/maps/map/{z}/{x}/{y}.pbf",
      {
        vectorTileLayerStyles: {
          cities: {
            radius: 4,
            fill: true,
            fillColor: "blue",
            fillOpacity: 0.8,
            stroke: true,
            color: "white",
            weight: 1,
          },
        },
        interactive: true,
        maxNativeZoom: 14,
        maxZoom: 19,
      }
    );

    vectorTileLayer.addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}