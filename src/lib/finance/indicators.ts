// Indicadores financieros: VAN, TIR y TCEA (secciones 6.3.12 - 6.3.14 y 7.3).

/**
 * Valor Actual Neto de una serie de flujos.
 * flujos[0] corresponde al periodo 0 (sin descuento), flujos[t] al periodo t.
 * @param rate tasa de descuento por periodo (decimal)
 */
export function npv(rate: number, flujos: number[]): number {
  let acc = 0;
  for (let t = 0; t < flujos.length; t++) {
    acc += flujos[t] / Math.pow(1 + rate, t);
  }
  return acc;
}

/** Derivada de npv respecto a la tasa (para Newton-Raphson). */
function npvDerivative(rate: number, flujos: number[]): number {
  let acc = 0;
  for (let t = 1; t < flujos.length; t++) {
    acc += (-t * flujos[t]) / Math.pow(1 + rate, t + 1);
  }
  return acc;
}

/**
 * Tasa Interna de Retorno por periodo.
 * Usa Newton-Raphson con respaldo en biseccion para garantizar convergencia
 * (seccion 7.3 del informe). Devuelve null si no hay una estructura valida de flujos.
 */
export function irr(flujos: number[], guess = 0.01): number | null {
  // Debe existir al menos un cambio de signo para que exista TIR real.
  const tieneSignoPositivo = flujos.some((f) => f > 0);
  const tieneSignoNegativo = flujos.some((f) => f < 0);
  if (!tieneSignoPositivo || !tieneSignoNegativo) return null;

  // 1) Newton-Raphson.
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    const f = npv(rate, flujos);
    if (Math.abs(f) < 1e-9) return rate;
    const d = npvDerivative(rate, flujos);
    if (d === 0) break;
    const next = rate - f / d;
    if (!Number.isFinite(next) || next <= -0.999999) break;
    if (Math.abs(next - rate) < 1e-12) return next;
    rate = next;
  }

  // 2) Respaldo: biseccion en un rango amplio.
  let lo = -0.9999;
  let hi = 10;
  let fLo = npv(lo, flujos);
  let fHi = npv(hi, flujos);
  if (fLo * fHi > 0) return null; // sin cambio de signo en el rango
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid, flujos);
    if (Math.abs(fMid) < 1e-9) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Tasa de Costo Efectivo Anual a partir de la TIR mensual.
 * TCEA = (1 + TIR_mensual)^12 - 1
 */
export function tcea(tirMensual: number): number {
  return Math.pow(1 + tirMensual, 12) - 1;
}
