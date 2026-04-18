// 2. ЗАМЕНИ apps/frontend/components/map/FilterPanel.tsx полностью

"use client";

export type RoadClass =
  | "motorway"
  | "motorway_link"
  | "trunk"
  | "trunk_link"
  | "primary"
  | "primary_link"
  | "secondary"
  | "secondary_link";

export default function FilterPanel({
  collapsed,
  setCollapsed,
  minPopulation,
  setMinPopulation,
  cityKinds,
  toggleCityKind,
  roadClasses,
  toggleRoadClass,
  onApply,
  onReset
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  minPopulation: number;
  setMinPopulation: (v: number) => void;
  cityKinds: string[];
  toggleCityKind: (kind: string) => void;
  roadClasses: RoadClass[];
  toggleRoadClass: (kind: RoadClass) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 68,
        left: 12,
        zIndex: 15,
        width: collapsed ? 52 : 320,
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        fontFamily: "Arial, sans-serif",
        fontSize: 14
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: collapsed ? 0 : 10 }}>
        {!collapsed && <div style={{ fontWeight: 700 }}>Фильтры</div>}
        <button onClick={() => setCollapsed(!collapsed)} style={miniBtn}>
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {!collapsed && (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Мин. население: <b>{minPopulation.toLocaleString("ru-RU")}</b>
            </label>
            <input
              type="range"
              min={0}
              max={1000000}
              step={10000}
              value={minPopulation}
              onChange={(e) => setMinPopulation(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 6, fontWeight: 600 }}>Тип населённого пункта</div>
            <label style={{ display: "block" }}>
              <input type="checkbox" checked={cityKinds.includes("city")} onChange={() => toggleCityKind("city")} /> city
            </label>
            <label style={{ display: "block" }}>
              <input type="checkbox" checked={cityKinds.includes("town")} onChange={() => toggleCityKind("town")} /> town
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 6, fontWeight: 600 }}>Классы дорог</div>
            {(
              [
                "motorway",
                "motorway_link",
                "trunk",
                "trunk_link",
                "primary",
                "primary_link",
                "secondary",
                "secondary_link"
              ] as RoadClass[]
            ).map((kind) => (
              <label key={kind} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={roadClasses.includes(kind)}
                  onChange={() => toggleRoadClass(kind)}
                />{" "}
                {kind}
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onApply} style={applyBtn}>Применить</button>
            <button onClick={onReset} style={resetBtn}>Сброс</button>
          </div>
        </>
      )}
    </div>
  );
}

const applyBtn: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  border: "1px solid #2d6cdf",
  borderRadius: 6,
  background: "#2d6cdf",
  color: "#fff",
  cursor: "pointer"
};

const resetBtn: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer"
};

const miniBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#f5f5f5",
  cursor: "pointer"
};