import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Geo Platform</h1>
      <p>Базовый frontend-каркас геоплатформы.</p>
      <Link href="/map">Открыть карту</Link>
    </main>
  );
}