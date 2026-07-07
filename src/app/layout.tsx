import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoFinanZ — Simula. Analiza. Decide.",
  description:
    "Simulador de créditos vehiculares bajo la modalidad Compra Inteligente (método francés vencido con balloon).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
