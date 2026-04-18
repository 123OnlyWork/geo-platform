"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [37.618423, 55.751244],
      zoom: 4,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
          places: {
            type: "vector",
            url: "pmtiles:///pmtiles/places.pmtiles",
          },
          roads: {
            type: "vector",
            url: "pmtiles:///pmtiles/roads.pmtiles",
          },
          railways: {
            type: "vector",
            url: "pmtiles:///pmtiles/railways.pmtiles",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
          {
            id: "roads-line",
            type: "line",
            source: "roads",
            "source-layer": "roads",
            paint: {
              "line-color": "#666",
              "line-width": 1,
            },
          },
          {
            id: "railways-line",
            type: "line",
            source: "railways",
            "source-layer": "railways",
            paint: {
              "line-color": "#222",
              "line-width": 1,
              "line-dasharray": [2, 2],
            },
          },
          {
            id: "places-circle",
            type: "circle",
            source: "places",
            "source-layer": "places",
            paint: {
              "circle-radius": [
                "match",
                ["get", "place"],
                "city", 6,
                "town", 5,
                "village", 4,
                3
              ],
              "circle-color": "#d33",
              "circle-stroke-color": "#fff",
              "circle-stroke-width": 1
            },
          },
          {
            id: "places-label",
            type: "symbol",
            source: "places",
            "source-layer": "places",
            layout: {
              "text-field": ["coalesce", ["get", "name"], ""],
              "text-size": 12,
              "text-offset": [0, 1.2],
            },
            paint: {
              "text-color": "#222",
              "text-halo-color": "#fff",
              "text-halo-width": 1,
            },
          },
        ],
      },
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}