// Validacion de los datos de entrada segun las restricciones de la seccion 6.1.1
// (fuente de verdad, ya que el pseudocodigo 7.2 usaba rangos distintos).
import type { EntradaSimulacion } from "./types";

export interface ErroresValidacion {
  [campo: string]: string;
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
