import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Geo Platform</h1>
      <p>Базовая версия геоплатформы.</p>

      <div style={{ marginTop: 16 }}>
        <Link href="/map">Открыть карту</Link>
      </div>
    </main>
  );
}