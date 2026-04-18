// apps/frontend/app/layout.tsx
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Geo Platform",
  description: "MapLibre + PMTiles"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}