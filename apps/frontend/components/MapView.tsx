"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { mapStyle } from "../lib/map-style";
import Header from "./layout/Header";
import FilterPanel, { type RoadClass } from "./map/FilterPanel";
import EconomyPanel from "./economy/EconomyPanel";
import {
  type EnterpriseGameNode,
  type EnterprisePoint,
  type Goods,
  calcTradeProfit,
  parsePopulation,
  classifyIndustry
} from "./economy/economyLogic";

let protocolRegistered = false;

const menuBtn = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.15)",
  background: active ? "#2d6cdf" : "transparent",
  color: "#fff",
  cursor: "pointer",
});

const actionBtn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #2d6cdf",
  borderRadius: 6,
  background: "#2d6cdf",
  color: "#fff",
  cursor: "pointer",
};

const applyBtn: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  border: "1px solid #2d6cdf",
  borderRadius: 6,
  background: "#2d6cdf",
  color: "#fff",
  cursor: "pointer",
};

const resetBtn: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer",
};

const miniBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: 68,
  right: 12,
  zIndex: 15,
  width: 320,
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
  background: "rgba(255,255,255,0.96)",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
  fontFamily: "Arial, sans-serif",
  fontSize: 14,
};

function mercatorFromLngLat(lng: number, lat: number): [number, number] {
  const x = (lng * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return [x, y];
}

const CITY_LAYER_ID = "places-circle";
const CITY_LABEL_LAYER_ID = "places-label";
const ROADS_LAYER_ID = "roads-line";
const ENTERPRISES_LAYER_ID = "enterprises-circle";

const DEFAULT_CITY_KINDS = ["city", "town"];
const DEFAULT_ROAD_CLASSES: RoadClass[] = ["motorway", "trunk", "primary"];

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [nearbyEnterprises, setNearbyEnterprises] = useState<
    EnterpriseGameNode[]
  >([]);
  const [selectedEnterprise, setSelectedEnterprise] =
    useState<EnterpriseGameNode | null>(null);
  const [minPopulation, setMinPopulation] = useState(100000);
  const [cityKinds, setCityKinds] = useState<string[]>(DEFAULT_CITY_KINDS);
  const [roadClasses, setRoadClasses] =
    useState<RoadClass[]>(DEFAULT_ROAD_CLASSES);

  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"map" | "economy" | "stats">(
    "map",
  );
  const [money, setMoney] = useState(1000000);
  const [turn, setTurn] = useState(1);

  const [selectedCity, setSelectedCity] = useState<{
    name: string;
    population: number;
    coords: [number, number];
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!protocolRegistered) {
      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);
      protocolRegistered = true;
    }

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: mapStyle as any,
      center: [37.6176, 55.7558],
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
    });

    mapInstanceRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      applyFilters(map, 100000, DEFAULT_CITY_KINDS, DEFAULT_ROAD_CLASSES);

      // 2. ЗАМЕНИ обработчик клика по городу внутри map.on("load", ...)

      map.on("click", CITY_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const name =
          (feature.properties?.["name:ru"] as string) ||
          (feature.properties?.name as string) ||
          "Без названия";

        const population = parsePopulation(feature.properties?.population);
        const place = String(feature.properties?.place ?? "");
        const coords = (
          feature.geometry as GeoJSON.Point
        ).coordinates.slice() as [number, number];

        setSelectedCity({ name, population, coords });

        const found = loadNearbyEnterprisesFromMap(map, coords, 120);
        setNearbyEnterprises(found);
        setSelectedEnterprise(found[0] ?? null);

        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(
            `<strong>${name}</strong><br/>Тип: ${place}<br/>Население: ${population || 0}<br/>Предприятий рядом: ${found.length}`,
          )
          .addTo(map);
      });

      // 2. ВНУТРИ map.on("load", ...) ДОБАВЬ обработчик клика по предприятиям

      map.on("click", ENTERPRISES_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const coords = (
          feature.geometry as GeoJSON.Point
        ).coordinates.slice() as [number, number];

        const enterprise: EnterpriseGameNode = {
          osm_id: Number(feature.properties?.osm_id ?? 0),
          name: String(feature.properties?.name ?? "Без названия"),
          place: feature.properties?.place
            ? String(feature.properties.place)
            : null,
          population: Number(feature.properties?.population ?? 0),
          amenity: feature.properties?.amenity
            ? String(feature.properties.amenity)
            : null,
          shop: feature.properties?.shop
            ? String(feature.properties.shop)
            : null,
          tourism: feature.properties?.tourism
            ? String(feature.properties.tourism)
            : null,
          office: feature.properties?.office
            ? String(feature.properties.office)
            : null,
          craft: feature.properties?.craft
            ? String(feature.properties.craft)
            : null,
          industrial: feature.properties?.industrial
            ? String(feature.properties.industrial)
            : null,
          power: feature.properties?.power
            ? String(feature.properties.power)
            : null,
          coords,
          industry: classifyIndustry({
            osm_id: Number(feature.properties?.osm_id ?? 0),
            name: String(feature.properties?.name ?? "Без названия"),
            place: feature.properties?.place
              ? String(feature.properties.place)
              : null,
            population: Number(feature.properties?.population ?? 0),
            amenity: feature.properties?.amenity
              ? String(feature.properties.amenity)
              : null,
            shop: feature.properties?.shop
              ? String(feature.properties.shop)
              : null,
            tourism: feature.properties?.tourism
              ? String(feature.properties.tourism)
              : null,
            office: feature.properties?.office
              ? String(feature.properties.office)
              : null,
            craft: feature.properties?.craft
              ? String(feature.properties.craft)
              : null,
            industrial: feature.properties?.industrial
              ? String(feature.properties.industrial)
              : null,
            power: feature.properties?.power
              ? String(feature.properties.power)
              : null,
            coords,
          }),
          demand: {},
          supply: {},
          basePrice: 100,
        };

        setSelectedEnterprise(enterprise);

        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(
            `<strong>${enterprise.name}</strong><br/>` +
              `shop: ${enterprise.shop ?? "-"}<br/>` +
              `amenity: ${enterprise.amenity ?? "-"}<br/>` +
              `office: ${enterprise.office ?? "-"}<br/>` +
              `craft: ${enterprise.craft ?? "-"}<br/>` +
              `industrial: ${enterprise.industrial ?? "-"}`,
          )
          .addTo(map);
      });

      map.on("mouseenter", CITY_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", CITY_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", ENTERPRISES_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", ENTERPRISES_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  function toggleCityKind(kind: string) {
    setCityKinds((prev) =>
      prev.includes(kind) ? prev.filter((x) => x !== kind) : [...prev, kind],
    );
  }

  function onNextTurn() {
    setTurn((prev) => prev + 1);
  }
  function toggleRoadClass(kind: RoadClass) {
    setRoadClasses((prev) =>
      prev.includes(kind) ? prev.filter((x) => x !== kind) : [...prev, kind],
    );
  }

  function onTrade(good: Goods, amount: number) {
    if (!selectedCity || !selectedEnterprise) return;

    const t = calcTradeProfit({
      cityPopulation: selectedCity.population,
      node: selectedEnterprise,
      good,
      amount,
    });

    setMoney((prev) => prev + t.profit);
  }

  function handleApply() {
    const map = mapInstanceRef.current;
    if (!map) return;
    applyFilters(
      map,
      minPopulation,
      cityKinds.length ? cityKinds : DEFAULT_CITY_KINDS,
      roadClasses.length ? roadClasses : DEFAULT_ROAD_CLASSES,
    );
  }

  function handleReset() {
    const map = mapInstanceRef.current;
    if (!map) return;

    setMinPopulation(100000);
    setCityKinds(DEFAULT_CITY_KINDS);
    setRoadClasses(DEFAULT_ROAD_CLASSES);

    applyFilters(map, 100000, DEFAULT_CITY_KINDS, DEFAULT_ROAD_CLASSES);
  }
  // 1. ДОБАВЬ helper внутрь MapView(), перед return

  function loadNearbyEnterprisesFromMap(
    map: Map,
    cityCoords: [number, number],
    radiusPx = 80,
  ): EnterpriseGameNode[] {
    const p = map.project({ lng: cityCoords[0], lat: cityCoords[1] });

    const features = map.queryRenderedFeatures(
      [
        [p.x - radiusPx, p.y - radiusPx],
        [p.x + radiusPx, p.y + radiusPx],
      ],
      { layers: ["enterprises-circle"] },
    );

    const items = features.map((feature) => {
      const coords = (
        feature.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number];

      const base: EnterprisePoint = {
        osm_id: Number(feature.properties?.osm_id ?? 0),
        name: feature.properties?.name ? String(feature.properties.name) : null,
        place: feature.properties?.place
          ? String(feature.properties.place)
          : null,
        population: Number(feature.properties?.population ?? 0),
        amenity: feature.properties?.amenity
          ? String(feature.properties.amenity)
          : null,
        shop: feature.properties?.shop ? String(feature.properties.shop) : null,
        tourism: feature.properties?.tourism
          ? String(feature.properties.tourism)
          : null,
        office: feature.properties?.office
          ? String(feature.properties.office)
          : null,
        craft: feature.properties?.craft
          ? String(feature.properties.craft)
          : null,
        industrial: feature.properties?.industrial
          ? String(feature.properties.industrial)
          : null,
        power: feature.properties?.power
          ? String(feature.properties.power)
          : null,
        coords,
      };

      const industry = classifyIndustry(base);
      const profile = industry
        ? {
            logistics: {
              demand: { fuel: 25, services: 10, consumer: 5 },
              supply: { services: 18 },
              basePrice: 110,
            },
            retail: {
              demand: { consumer: 40, food: 20, fuel: 10, services: 10 },
              supply: { consumer: 18, services: 8 },
              basePrice: 120,
            },
            food: {
              demand: { food: 25, energy: 8, materials: 5 },
              supply: { food: 20 },
              basePrice: 90,
            },
            tourism: {
              demand: { food: 15, consumer: 10, fuel: 8, services: 20 },
              supply: { services: 28 },
              basePrice: 150,
            },
            office: {
              demand: { services: 10, energy: 8, consumer: 6 },
              supply: { services: 25 },
              basePrice: 130,
            },
            craft: {
              demand: { materials: 30, energy: 12, services: 6 },
              supply: { consumer: 16, materials: 8 },
              basePrice: 140,
            },
            industrial: {
              demand: { materials: 45, energy: 20, fuel: 15 },
              supply: { materials: 18 },
              basePrice: 180,
            },
            energy: {
              demand: { materials: 10, fuel: 5 },
              supply: { energy: 60 },
              basePrice: 160,
            },
          }[industry]
        : { demand: {}, supply: {}, basePrice: 100 };

      return {
        ...base,
        industry,
        demand: profile.demand,
        supply: profile.supply,
        basePrice: profile.basePrice,
      } as EnterpriseGameNode;
    });

    return items.filter((x) => x.industry);
  }

  return (
    <>
      <Header
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        money={money}
        turn={turn}
        onNextTurn={onNextTurn}
      />

      <div
        ref={mapRef}
        style={{ width: "100vw", height: "100vh", paddingTop: 56 }}
      />

      <FilterPanel
        collapsed={filterCollapsed}
        setCollapsed={setFilterCollapsed}
        minPopulation={minPopulation}
        setMinPopulation={setMinPopulation}
        cityKinds={cityKinds}
        toggleCityKind={toggleCityKind}
        roadClasses={roadClasses}
        toggleRoadClass={toggleRoadClass}
        onApply={handleApply}
        onReset={handleReset}
      />

      {activeMenu === "economy" && (
        <EconomyPanel
          selectedCity={selectedCity}
          selectedEnterprise={selectedEnterprise}
          nearbyEnterprises={nearbyEnterprises}
          onSelectEnterprise={setSelectedEnterprise}
          onTrade={onTrade}
          money={money}
        />
      )}
    </>
  );
}

function applyFilters(
  map: Map,
  minPopulation: number,
  cityKinds: string[],
  roadClasses: RoadClass[],
) {
  const safeCityKinds = cityKinds.length ? cityKinds : DEFAULT_CITY_KINDS;
  const safeRoadClasses = roadClasses.length
    ? roadClasses
    : DEFAULT_ROAD_CLASSES;

  const cityFilter: any = [
    "all",
    [
      "match",
      ["downcase", ["coalesce", ["get", "place"], ""]],
      safeCityKinds,
      true,
      false,
    ],
    [
      ">=",
      ["to-number", ["coalesce", ["get", "population"], 0]],
      minPopulation,
    ],
  ];

  const roadFilter: any = [
    "match",
    ["downcase", ["coalesce", ["get", "highway"], ""]],
    safeRoadClasses,
    true,
    false,
  ];

  if (map.getLayer(CITY_LAYER_ID)) {
    map.setFilter(CITY_LAYER_ID, cityFilter);
  }

  if (map.getLayer(CITY_LABEL_LAYER_ID)) {
    map.setFilter(CITY_LABEL_LAYER_ID, cityFilter);
  }

  if (map.getLayer(ROADS_LAYER_ID)) {
    map.setFilter(ROADS_LAYER_ID, roadFilter);
  }
}
