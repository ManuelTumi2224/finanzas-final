// Conversion de tasas (secciones 6.3.4 y 6.3.5 del informe).
import { CAPITALIZACIONES_POR_ANIO, type Capitalizacion } from "./types";

/**
 * Convierte una TNA (Tasa Nominal Anual) a TEA (Tasa Efectiva Anual).
 * TEA = (1 + TNA/m)^m - 1
 * @param tnaDecimal TNA en decimal (0.12 = 12%)
 * @param cap frecuencia de capitalizacion
 */
export function tnaToTea(tnaDecimal: number, cap: Capitalizacion): number {
  const m = CAPITALIZACIONES_POR_ANIO[cap];
  return Math.pow(1 + tnaDecimal / m, m) - 1;
}

/**
 * Convierte una TEA a TEM (Tasa Efectiva Mensual).
 * TEM = (1 + TEA)^(30/360) - 1  (meses de 30 dias, anio de 360 dias => exponente 1/12)
 */
export function teaToTem(teaDecimal: number): number {
  return Math.pow(1 + teaDecimal, 30 / 360) - 1;
}
