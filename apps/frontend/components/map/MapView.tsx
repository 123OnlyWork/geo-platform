"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.vectorgrid";
import { useMapConfig } from "@/hooks/useMapConfig";

type VectorGridLeaflet = typeof L & {
  vectorGrid?: {
    protobuf: (
      url: string,
      options: {
        interactive?: boolean;
        vectorTileLayerStyles?: Record<string, any>;
      }
    ) => L.Layer;
  };
};

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vectorLayerRef = useRef<L.Layer | null>(null);

  const { config, loading, error, tileLayerEnabled, setTileLayerEnabled } = useMapConfig();
  const [tileError, setTileError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: config.center,
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (vectorLayerRef.current) {
        vectorLayerRef.current.remove();
        vectorLayerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(config.center, config.zoom);
  }, [config.center, config.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (vectorLayerRef.current) {
      vectorLayerRef.current.remove();
      vectorLayerRef.current = null;
    }

    setTileError(null);

    if (!tileLayerEnabled) return;

    const vectorLeaflet = L as VectorGridLeaflet;
    if (!vectorLeaflet.vectorGrid?.protobuf) {
      setTileError("leaflet.vectorgrid is not available");
      return;
    }

    try {
      const vectorLayer = vectorLeaflet.vectorGrid.protobuf(config.tileUrl, {
        interactive: true,
        vectorTileLayerStyles: {
          roads: {
            weight: 1.5,
            opacity: 0.9,
          },
          water: {
            weight: 1,
            opacity: 0.8,
            fill: true,
            fillOpacity: 0.5,
          },
          buildings: {
            weight: 1,
            opacity: 0.7,
            fill: true,
            fillOpacity: 0.35,
          },
          places: {
            radius: 4,
            opacity: 1,
            fill: true,
            fillOpacity: 0.8,
          },
        },
      });

      vectorLayer.addTo(map);
      vectorLayerRef.current = vectorLayer;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load vector tiles";
      setTileError(message);
      setTileLayerEnabled(false);
    }
  }, [config, tileLayerEnabled, setTileLayerEnabled]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          background: "#fff",
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          minWidth: 280,
        }}
      >
        <div><strong>Map status</strong></div>
        <div>API config: {loading ? "loading..." : "loaded"}</div>
        <div>Vector layer: {tileLayerEnabled ? "enabled" : "disabled"}</div>
        <div style={{ wordBreak: "break-all" }}>Tile URL: {config.tileUrl}</div>

        {error && <div style={{ color: "crimson" }}>Backend config error: {error}</div>}
        {tileError && <div style={{ color: "crimson" }}>Vector tile error: {tileError}</div>}

        <button
          onClick={() => setTileLayerEnabled((prev) => !prev)}
          style={{
            marginTop: 10,
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            padding: "8px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {tileLayerEnabled ? "Disable vector tiles" : "Enable vector tiles"}
        </button>
      </div>
    </div>
  );
}