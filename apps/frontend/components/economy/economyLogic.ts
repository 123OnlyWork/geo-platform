// apps/frontend/components/economy/economyLogic.ts
export type Industry =
  | "logistics"
  | "retail"
  | "food"
  | "tourism"
  | "office"
  | "craft"
  | "industrial"
  | "energy";

export type Goods = "food" | "consumer" | "fuel" | "materials" | "services" | "energy";

export type EnterprisePoint = {
  osm_id: number;
  name: string | null;
  place?: string | null;
  population?: number | null;
  amenity?: string | null;
  shop?: string | null;
  tourism?: string | null;
  office?: string | null;
  craft?: string | null;
  industrial?: string | null;
  power?: string | null;
  coords: [number, number];
};

export type EnterpriseGameNode = EnterprisePoint & {
  industry: Industry | null;
  demand: Partial<Record<Goods, number>>;
  supply: Partial<Record<Goods, number>>;
  basePrice: number;
};

export function parsePopulation(val: unknown): number {
  if (val == null) return 0;
  const cleaned = String(val).replace(/\s/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function classifyIndustry(row: EnterprisePoint): Industry | null {
  if (row.shop === "outpost" || row.shop || row.amenity === "marketplace") return "retail";
  if (row.tourism) return "tourism";
  if (row.office) return "office";
  if (row.craft) return "craft";
  if (row.industrial) return "industrial";
  if (row.power) return "energy";
  if (row.amenity === "cafe" || row.amenity === "restaurant" || row.amenity === "fast_food") return "food";
  if (row.amenity === "fuel" || row.amenity === "bus_station") return "logistics";
  return null;
}

export function industryProfile(industry: Industry) {
  switch (industry) {
    case "retail":
      return {
        demand: { consumer: 40, food: 20, fuel: 10, services: 10 },
        supply: { consumer: 18, services: 8 },
        basePrice: 120
      };
    case "food":
      return {
        demand: { food: 25, energy: 8, materials: 5 },
        supply: { food: 20 },
        basePrice: 90
      };
    case "tourism":
      return {
        demand: { food: 15, consumer: 10, fuel: 8, services: 20 },
        supply: { services: 28 },
        basePrice: 150
      };
    case "office":
      return {
        demand: { services: 10, energy: 8, consumer: 6 },
        supply: { services: 25 },
        basePrice: 130
      };
    case "craft":
      return {
        demand: { materials: 30, energy: 12, services: 6 },
        supply: { consumer: 16, materials: 8 },
        basePrice: 140
      };
    case "industrial":
      return {
        demand: { materials: 45, energy: 20, fuel: 15 },
        supply: { materials: 18 },
        basePrice: 180
      };
    case "energy":
      return {
        demand: { materials: 10, fuel: 5 },
        supply: { energy: 60 },
        basePrice: 160
      };
    case "logistics":
      return {
        demand: { fuel: 25, services: 10, consumer: 5 },
        supply: { services: 18 },
        basePrice: 110
      };
  }
}

export function toGameNodes(rows: EnterprisePoint[]): EnterpriseGameNode[] {
  return rows
    .map((row) => {
      const industry = classifyIndustry(row);
      if (!industry) return null;
      const p = industryProfile(industry);
      return {
        ...row,
        industry,
        demand: p.demand,
        supply: p.supply,
        basePrice: p.basePrice
      };
    })
    .filter(Boolean) as EnterpriseGameNode[];
}

export function calcCityDemand(population: number) {
  const k = Math.max(1, population / 10000);
  return {
    food: Math.round(8 * k),
    consumer: Math.round(7 * k),
    fuel: Math.round(3 * k),
    materials: Math.round(2 * k),
    services: Math.round(5 * k),
    energy: Math.round(4 * k)
  };
}

export function calcTradeProfit(args: {
  cityPopulation: number;
  node: EnterpriseGameNode;
  good: Goods;
  amount: number;
}) {
  const cityDemand = calcCityDemand(args.cityPopulation);
  const need = cityDemand[args.good] ?? 0;
  const supply = args.node.supply[args.good] ?? 0;
  const demand = args.node.demand[args.good] ?? 0;

  const scarcity = Math.max(0.8, Math.min(2.2, (need + demand + 1) / (supply + 1)));
  const unitPrice = Math.round(args.node.basePrice * scarcity);
  const revenue = unitPrice * args.amount;
  const cost = Math.round(unitPrice * 0.68) * args.amount;
  const profit = revenue - cost;

  return { unitPrice, revenue, cost, profit, scarcity };
}