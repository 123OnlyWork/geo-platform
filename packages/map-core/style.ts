export const mapStyle = {
  version: 8,
  sources: {
    osm: {
      type: "vector",
      tiles: ["http://localhost:8080/maps/map/{z}/{x}/{y}.pbf"]
    }
  },

  layers: [

    // LANDUSE
    {
      id: "landuse",
      type: "fill",
      source: "osm",
      "source-layer": "landuse",
      paint: {
        "fill-color": "#e5e5e5",
        "fill-opacity": 0.4
      }
    },

    // WATER
    {
      id: "water",
      type: "fill",
      source: "osm",
      "source-layer": "water",
      paint: {
        "fill-color": "#a6d8ff"
      }
    },

    // ROADS
    {
      id: "roads",
      type: "line",
      source: "osm",
      "source-layer": "roads",
      paint: {
        "line-color": "#ffffff",
        "line-width": 1.2
      }
    },

    // RAILWAYS
    {
      id: "railways",
      type: "line",
      source: "osm",
      "source-layer": "railways",
      paint: {
        "line-color": "#999999",
        "line-dasharray": [2, 2],
        "line-width": 1
      }
    },

    // BUILDINGS
    {
      id: "buildings",
      type: "fill",
      source: "osm",
      "source-layer": "buildings",
      paint: {
        "fill-color": "#cfcfcf",
        "fill-outline-color": "#a0a0a0"
      }
    },

    // PLACES
    {
      id: "places",
      type: "circle",
      source: "osm",
      "source-layer": "places",
      paint: {
        "circle-radius": 4,
        "circle-color": "#ff6b6b"
      }
    }
  ]
};