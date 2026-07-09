// Validacion de los datos de entrada segun las restricciones de la seccion 6.1.1
// (fuente de verdad, ya que el pseudocodigo 7.2 usaba rangos distintos).
import type { EntradaSimulacion } from "./types";
import type { EntradaInterbank } from "./interbank";

export interface ErroresValidacion {
  [campo: string]: string;
}

/** Validacion para el modelo Compra Inteligente (Estilo Interbank). */
export function validarEntradaInterbank(
  e: Partial<EntradaInterbank>,
): ErroresValidacion {
  const err: ErroresValidacion = {};
  const n = (x: unknown): x is number => typeof x === "number" && !Number.isNaN(x);

  if (e.moneda !== "PEN" && e.moneda !== "USD") err.moneda = "Selecciona una moneda válida.";
  if (!n(e.precioVehiculo) || e.precioVehiculo <= 0)
    err.precioVehiculo = "El precio del vehículo debe ser mayor a 0.";
  if (!n(e.cuotaInicialPct) || e.cuotaInicialPct < 10 || e.cuotaInicialPct > 50)
    err.cuotaInicialPct = "La cuota inicial debe estar entre 10% y 50%.";
  if (!n(e.cuotaFinalPct) || e.cuotaFinalPct < 10 || e.cuotaFinalPct > 40)
    err.cuotaFinalPct = "La cuota final debe estar entre 10% y 40%.";
  if (!n(e.plazoMeses) || !Number.isInteger(e.plazoMeses) || e.plazoMeses < 12 || e.plazoMeses > 60)
    err.plazoMeses = "El plazo debe ser un entero entre 12 y 60 meses.";
  if (e.tipoTasa !== "TEA" && e.tipoTasa !== "TNA") err.tipoTasa = "Selecciona TEA o TNA.";
  if (!n(e.valorTasa) || e.valorTasa <= 0) err.valorTasa = "El valor de la tasa debe ser mayor a 0.";
  if (e.tipoTasa === "TNA" && !e.capitalizacion)
    err.capitalizacion = "La TNA requiere una frecuencia de capitalización.";

  const gT = e.graciaTotalMeses ?? 0;
  const gP = e.graciaParcialMeses ?? 0;
  if (gT < 0 || !Number.isInteger(gT)) err.graciaTotalMeses = "Meses de gracia total inválidos.";
  if (gP < 0 || !Number.isInteger(gP)) err.graciaParcialMeses = "Meses de gracia parcial inválidos.";
  if (n(e.plazoMeses) && gT + gP >= e.plazoMeses)
    err.graciaParcialMeses = "La gracia total no puede alcanzar el plazo del crédito.";

  const noNeg: [keyof EntradaInterbank, string][] = [
    ["costesIniciales", "Los costes iniciales no pueden ser negativos."],
    ["gpsPeriodico", "El GPS no puede ser negativo."],
    ["portesPeriodico", "Los portes no pueden ser negativos."],
    ["gastosAdmPeriodico", "Los gastos de administración no pueden ser negativos."],
    ["seguroDesgravamenPct", "El seguro de desgravamen no puede ser negativo."],
    ["seguroRiesgoPct", "El seguro de riesgo no puede ser negativo."],
    ["cokAnualPct", "La tasa de descuento (COK) no puede ser negativa."],
  ];
  for (const [k, msg] of noNeg) {
    const v = e[k];
    if (v != null && (typeof v !== "number" || v < 0)) err[k] = msg;
  }
  return err;
}

export function validarEntrada(e: Partial<EntradaSimulacion>): ErroresValidacion {
  const err: ErroresValidacion = {};

  if (e.moneda !== "PEN" && e.moneda !== "USD") {
    err.moneda = "Selecciona una moneda válida.";
  }
  if (!(typeof e.precioVehiculo === "number") || e.precioVehiculo <= 0) {
    err.precioVehiculo = "El precio del vehículo debe ser mayor a 0.";
  }
  if (
    typeof e.cuotaInicialPct !== "number" ||
    e.cuotaInicialPct < 10 ||
    e.cuotaInicialPct > 50
  ) {
    err.cuotaInicialPct = "La cuota inicial debe estar entre 10% y 50%.";
  }
  if (
    typeof e.balloonPct !== "number" ||
    e.balloonPct < 10 ||
    e.balloonPct > 40
  ) {
    err.balloonPct = "La cuota final (balloon) debe estar entre 10% y 40%.";
  }
  if (
    typeof e.plazoMeses !== "number" ||
    !Number.isInteger(e.plazoMeses) ||
    e.plazoMeses < 12 ||
    e.plazoMeses > 60
  ) {
    err.plazoMeses = "El plazo debe ser un entero entre 12 y 60 meses.";
  }
  if (e.tipoTasa !== "TEA" && e.tipoTasa !== "TNA") {
    err.tipoTasa = "Selecciona TEA o TNA.";
  }
  if (typeof e.valorTasa !== "number" || e.valorTasa <= 0) {
    err.valorTasa = "El valor de la tasa debe ser mayor a 0.";
  }
  if (e.tipoTasa === "TNA" && !e.capitalizacion) {
    err.capitalizacion = "La TNA requiere una frecuencia de capitalización.";
  }
  if (!["ninguna", "parcial", "total"].includes(e.tipoGracia ?? "")) {
    err.tipoGracia = "Selecciona un tipo de gracia válido.";
  }
  if (
    typeof e.mesesGracia !== "number" ||
    !Number.isInteger(e.mesesGracia) ||
    e.mesesGracia < 0 ||
    e.mesesGracia > 6
  ) {
    err.mesesGracia = "Los meses de gracia deben estar entre 0 y 6.";
  }
  // Regla del 7.4: la gracia debe ser menor al plazo total.
  if (
    typeof e.mesesGracia === "number" &&
    typeof e.plazoMeses === "number" &&
    e.mesesGracia >= e.plazoMeses
  ) {
    err.mesesGracia = "Los meses de gracia deben ser menores al plazo.";
  }
  if (e.tipoGracia !== "ninguna" && (e.mesesGracia ?? 0) === 0) {
    err.mesesGracia = "Indica los meses de gracia (mayor a 0).";
  }
  if (typeof e.seguroDesgravamenPct !== "number" || e.seguroDesgravamenPct < 0) {
    err.seguroDesgravamenPct = "El seguro de desgravamen no puede ser negativo.";
  }
  if (typeof e.seguroVehicular !== "number" || e.seguroVehicular < 0) {
    err.seguroVehicular = "El seguro vehicular no puede ser negativo.";
  }

  return err;
}
