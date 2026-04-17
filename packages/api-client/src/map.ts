import type { MapMetaResponse } from "@geo/types";

export async function getMapMeta(apiBaseUrl: string): Promise<MapMetaResponse> {
  const response = await fetch(`${apiBaseUrl}/api/map/meta`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to load map metadata: ${response.status}`);
  }

  return response.json() as Promise<MapMetaResponse>;
}