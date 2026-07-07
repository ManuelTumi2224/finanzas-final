// Utilidades de formato para montos, porcentajes y moneda.
import type { Moneda } from "./finance/types";

const SIMBOLO: Record<Moneda, string> = {
  PEN: "S/",
  USD: "US$",
};

export function simboloMoneda(moneda: Moneda): string {
  return SIMBOLO[moneda] ?? "S/";
}

export function fmtMonto(valor: number, moneda: Moneda = "PEN"): string {
  const s = valor.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${simboloMoneda(moneda)} ${s}`;
}

export function fmtNumero(valor: number): string {
  return valor.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Recibe una tasa en decimal (0.1955) y la muestra como porcentaje. */
export function fmtPct(decimal: number, dec = 4): string {
  return `${(decimal * 100).toFixed(dec)}%`;
}
