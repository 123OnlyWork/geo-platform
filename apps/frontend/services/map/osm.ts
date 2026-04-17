import api from "../api";

export async function fetchCities() {
  return api.get("/osm/cities");
}

export async function fetchRoads() {
  return api.get("/osm/roads");
}