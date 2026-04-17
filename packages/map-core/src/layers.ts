import type { MapLayerInfo } from "@geo/types";

export const DEFAULT_LAYERS: MapLayerInfo[] = [
  { key: "roads", label: "Roads", minZoom: 6, maxZoom: 20 },
  { key: "railways", label: "Railways", minZoom: 8, maxZoom: 20 },
  { key: "water", label: "Water", minZoom: 0, maxZoom: 20 },
  { key: "landuse", label: "Land Use", minZoom: 5, maxZoom: 20 },
  { key: "buildings", label: "Buildings", minZoom: 14, maxZoom: 20 },
  { key: "places", label: "Places", minZoom: 4, maxZoom: 20 }
];