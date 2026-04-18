// 6. ЗАМЕНИ apps/frontend/components/economy/EconomyPanel.tsx полностью

"use client";

import { EnterpriseGameNode, Goods, calcTradeProfit } from "./economyLogic";

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: 68,
  right: 12,
  zIndex: 15,
  width: 360,
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
  background: "rgba(255,255,255,0.96)",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
  fontFamily: "Arial, sans-serif",
  fontSize: 14
};

const actionBtn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #2d6cdf",
  borderRadius: 6,
  background: "#2d6cdf",
  color: "#fff",
  cursor: "pointer"
};

export default function EconomyPanel({
  selectedCity,
  selectedEnterprise,
  nearbyEnterprises,
  onSelectEnterprise,
  onTrade,
  money
}: {
  selectedCity: { name: string; population: number } | null;
  selectedEnterprise: EnterpriseGameNode | null;
  nearbyEnterprises: EnterpriseGameNode[];
  onSelectEnterprise: (node: EnterpriseGameNode) => void;
  onTrade: (good: Goods, amount: number) => void;
  money: number;
}) {
  if (!selectedCity) return <div style={panelStyle}>Выбери город</div>;

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>Экономика</div>

      <div style={{ marginBottom: 12, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
        <div><b>{selectedCity.name}</b></div>
        <div>Население: {selectedCity.population.toLocaleString("ru-RU")}</div>
        <div>Предприятий загружено: {nearbyEnterprises.length}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Предприятия в радиусе города</div>

        {nearbyEnterprises.length === 0 && <div>Рядом предприятий нет</div>}

        {nearbyEnterprises.map((item) => (
          <div
            key={item.osm_id}
            onClick={() => onSelectEnterprise(item)}
            style={{
              marginBottom: 8,
              padding: 10,
              border: selectedEnterprise?.osm_id === item.osm_id ? "1px solid #2d6cdf" : "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              background: selectedEnterprise?.osm_id === item.osm_id ? "#eef4ff" : "#fff"
            }}
          >
            <div><b>{item.name || "Без названия"}</b></div>
            <div>Отрасль: {item.industry || "unknown"}</div>
          </div>
        ))}
      </div>

      {selectedEnterprise && (
        <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
          <div><b>{selectedEnterprise.name || "Без названия"}</b></div>
          <div>Отрасль: {selectedEnterprise.industry}</div>

          <div style={{ marginTop: 10, fontWeight: 600 }}>Торговля</div>
          {(["food", "consumer", "fuel", "materials", "services", "energy"] as Goods[]).map((good) => {
            const t = calcTradeProfit({
              cityPopulation: selectedCity.population,
              node: selectedEnterprise,
              good,
              amount: 10
            });

            return (
              <div
                key={good}
                style={{
                  marginTop: 8,
                  padding: 8,
                  border: "1px solid #eee",
                  borderRadius: 6
                }}
              >
                <div><b>{good}</b></div>
                <div>Цена за ед.: {t.unitPrice.toLocaleString("ru-RU")} ₽</div>
                <div>Прибыль за 10 ед.: {t.profit.toLocaleString("ru-RU")} ₽</div>
                <button onClick={() => onTrade(good, 10)} style={{ ...actionBtn, marginTop: 6 }}>
                  Купить / продать
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}