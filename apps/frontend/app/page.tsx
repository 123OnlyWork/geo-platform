import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Geo Platform</h1>
      <p>Базовый frontend-каркас геоплатформы.</p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/map">Открыть карту</Link>
        <a href="http://localhost:8000/health" target="_blank" rel="noreferrer">
          API health
        </a>
      </div>
    </main>
  );
}