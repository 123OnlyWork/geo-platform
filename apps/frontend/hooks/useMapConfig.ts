"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { MapMetaResponse } from "@/types/map";

const fallbackConfig: MapMetaResponse = {
  tileUrl:
    process.env.NEXT_PUBLIC_TILE_URL ??
    "http://localhost:8080/maps/map/{z}/{x}/{y}.pbf",
  layers: [
    { key: "roads", label: "Roads", minZoom: 0, maxZoom: 22 },
    { key: "water", label: "Water", minZoom: 0, maxZoom: 22 },
    { key: "buildings", label: "Buildings", minZoom: 0, maxZoom: 22 },
    { key: "places", label: "Places", minZoom: 0, maxZoom: 22 },
  ],
  center: [55.751244, 37.618423],
  zoom: 10,
  minZoom: 0,
  maxZoom: 22,
};

export function useMapConfig() {
  const [config, setConfig] = useState<MapMetaResponse>(fallbackConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tileLayerEnabled, setTileLayerEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<MapMetaResponse>("/api/map/meta");

        if (!cancelled) {
          setConfig(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load map config";
          setError(message);
          setConfig(fallbackConfig);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    config,
    loading,
    error,
    tileLayerEnabled,
    setTileLayerEnabled
  };
}