import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false
});

export default function MapPage() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <MapView />
    </main>
  );
}