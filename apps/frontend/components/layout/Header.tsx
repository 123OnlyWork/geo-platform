// apps/frontend/components/layout/Header.tsx
"use client";

type MenuKey = "map" | "economy" | "stats";

export default function Header({
  activeMenu,
  setActiveMenu,
  money,
  turn,
  onNextTurn
}: {
  activeMenu: MenuKey;
  setActiveMenu: (v: MenuKey) => void;
  money: number;
  turn: number;
  onNextTurn: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "rgba(20,20,24,0.92)",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontWeight: 700 }}>Geo Economy</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setActiveMenu("map")} style={menuBtn(activeMenu === "map")}>
            Карта
          </button>
          <button onClick={() => setActiveMenu("economy")} style={menuBtn(activeMenu === "economy")}>
            Экономика
          </button>
          <button onClick={() => setActiveMenu("stats")} style={menuBtn(activeMenu === "stats")}>
            Статистика
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 14, alignItems: "center" }}>
        <div>Ход: <b>{turn}</b></div>
        <div>Баланс: <b>{money.toLocaleString("ru-RU")} ₽</b></div>
        <button onClick={onNextTurn} style={actionBtn}>
          Следующий ход
        </button>
      </div>
    </div>
  );
}

const menuBtn = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.15)",
  background: active ? "#2d6cdf" : "transparent",
  color: "#fff",
  cursor: "pointer"
});

const actionBtn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #2d6cdf",
  borderRadius: 6,
  background: "#2d6cdf",
  color: "#fff",
  cursor: "pointer"
};