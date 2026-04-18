// apps/frontend/lib/map-style.ts
export const mapStyle = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
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
    enterprises: {
      type: "vector",
      url: "pmtiles:///pmtiles/enterprises.pmtiles",
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
      minzoom: 4,
      paint: {
        "line-color": "#ff6b00",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          0.8,
          8,
          2,
          12,
          4,
        ],
      },
    },
    {
      id: "places-circle",
      type: "circle",
      source: "places",
      "source-layer": "places",
      minzoom: 4,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          3,
          8,
          5,
          12,
          7,
        ],
        "circle-color": "#d00",
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
      },
    },
    {
      id: "places-label",
      type: "symbol",
      source: "places",
      "source-layer": "places",
      minzoom: 4,
      layout: {
        "text-field": ["coalesce", ["get", "name"], ["get", "name:ru"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": 12,
        "text-offset": [0, 0.8],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#111",
        "text-halo-color": "#fff",
        "text-halo-width": 1,
      },
    },
    {
      id: "enterprises-label",
      type: "symbol",
      source: "enterprises",
      "source-layer": "enterprises",
      minzoom: 8,
      layout: {
        "text-field": [
          "coalesce",
          ["get", "name"],
          ["get", "shop"],
          ["get", "amenity"],
        ],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "text-offset": [0, 0.8],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#065f46",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1,
      },
    },
  ],
} as const;
