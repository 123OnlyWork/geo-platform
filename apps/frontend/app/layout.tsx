import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Geo Platform",
  description: "Geospatial platform frontend"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}