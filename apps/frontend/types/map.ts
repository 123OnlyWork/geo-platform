export type MapLayerKey =
  | "roads"
  | "railways"
  | "water"
  | "landuse"
  | "buildings"
  | "places";

export interface MapLayerInfo {
  key: MapLayerKey;
  label: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface MapMetaResponse {
  tileUrl: string;
  layers: MapLayerInfo[];
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
}