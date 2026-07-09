// Motor financiero "Compra Inteligente - Estilo Interbank", replicando EXACTAMENTE
// el modelo Excel entregado por el docente (hoja "Frances").
//
// Diferencias respecto del método simple:
//  - Al préstamo se le suman los costes/gastos iniciales (notariales, registrales, etc.).
//  - La cuota final (CF) se financia como un "cuotón" que capitaliza aparte su interés
//    y su seguro de desgravamen, y se paga en un periodo adicional (N+1).
//  - El saldo regular se amortiza con cuota francesa a una tasa (TEM + seguro desgravamen).
//  - Admite gracia TOTAL y PARCIAL combinadas (primero total, luego parcial).
//  - Gastos periódicos fijos: seguro de riesgo, GPS, portes y gastos de administración.
//  - VAN descontado a la tasa del inversionista (COK); TIR y TCEA sobre el flujo real.
//
// Verificado celda por celda contra el Excel del docente (ver interbank.test.ts).

import { CAPITALIZACIONES_POR_ANIO, type Capitalizacion, type Moneda } from "./types";
import { irr } from "./indicators";

// Días que dura cada periodo de capitalización (con año comercial de 360 días).
const DIAS_CAPITALIZACION: Record<Capitalizacion, number> = {
  diaria: 1,
  quincenal: 15,
  mensual: 30,
  bimestral: 60,
  trimestral: 90,
  cuatrimestral: 120,
  semestral: 180,
  anual: 360,
};

export interface EntradaInterbank {
  moneda: Moneda;
  precioVehiculo: number; // PV
  cuotaInicialPct: number; // pCI en % (ej. 20)
  cuotaFinalPct: number; // pCF en % (ej. 40)
  plazoMeses: number; // N (nº total de cuotas)
  tipoTasa: "TNA" | "TEA";
  valorTasa: number; // en % (ej. 15)
  capitalizacion?: Capitalizacion; // solo si TNA
  frecuenciaPagoDias?: number; // frec (por defecto 30)
  diasPorAnio?: number; // NDxA (por defecto 360)
  costesIniciales?: number; // suma de notariales+registrales+tasación+comisiones (se suman al préstamo)
  gpsPeriodico?: number; // GPS por periodo
  portesPeriodico?: number; // portes por periodo
  gastosAdmPeriodico?: number; // gastos de administración por periodo
  seguroDesgravamenPct?: number; // pSegDes en % (ej. 0.05 => 0.0005)
  seguroRiesgoPct?: number; // pSegRie en % (ej. 0.30 => 0.003)
  cokAnualPct?: number; // COK en % (ej. 50 => 0.5)
  graciaTotalMeses?: number; // gT
  graciaParcialMeses?: number; // gP
}

export interface FilaInterbank {
  nc: number; // número de cuota (1..N+1)
  pg: "T" | "P" | "S"; // periodo de gracia: Total, Parcial o Sin gracia
  // cuotón (cuota final)
  saldoInicialCF: number;
  interesCF: number;
  amortCF: number;
  segDesCF: number;
  saldoFinalCF: number;
  // cuota regular
  saldoInicial: number;
  interes: number;
  cuota: number; // incluye seguro de desgravamen (excepto en gracia)
  amortizacion: number;
  segDesgravamen: number;
  segRiesgo: number;
  gps: number;
  portes: number;
  gastosAdm: number;
  saldoFinal: number;
  flujo: number; // flujo de caja del periodo (negativo = pago)
}

export interface ResultadoInterbank {
  tea: number;
  tem: number;
  cuotaInicial: number; // CI
  cuotaFinal: number; // CF
  prestamo: number;
  saldoFinanciar: number; // saldo a financiar con cuotas
  cuotaRegular: number; // cuota constante del tramo sin gracia (incluye seg desgrav)
  segRiesgoPeriodico: number;
  totalIntereses: number;
  totalAmortizacion: number;
  totalSegDesgravamen: number;
  totalSegRiesgo: number;
  totalGps: number;
  totalPortes: number;
  totalGastosAdm: number;
  cokMensual: number;
  van: number;
  tirMensual: number;
  tcea: number;
  cronograma: FilaInterbank[];
}

/** Pago constante (equivalente a PMT de Excel): PMT(rate, nper, pv, 0, 0). */
function pmt(rate: number, nper: number, pv: number): number {
  if (nper <= 0) return 0;
  if (rate === 0) return -pv / nper;
  return -(pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

export function simularInterbank(e: EntradaInterbank): ResultadoInterbank {
  const PV = e.precioVehiculo;
  const pCI = e.cuotaInicialPct / 100;
  const pCF = e.cuotaFinalPct / 100;
  const N = e.plazoMeses;
  const tasa = e.valorTasa / 100;
  const frec = e.frecuenciaPagoDias ?? 30;
  const NDxA = e.diasPorAnio ?? 360;
  const NCxA = NDxA / frec;
  const costesIniciales = e.costesIniciales ?? 0;
  const gpsPer = e.gpsPeriodico ?? 0;
  const portesPer = e.portesPeriodico ?? 0;
  const gasAdmPer = e.gastosAdmPeriodico ?? 0;
  const pSegDes = (e.seguroDesgravamenPct ?? 0) / 100;
  const pSegRie = (e.seguroRiesgoPct ?? 0) / 100;
  const cok = (e.cokAnualPct ?? 0) / 100;
  const gT = e.graciaTotalMeses ?? 0;
  const gP = e.graciaParcialMeses ?? 0;

  // --- Tasas ---
  let tea: number;
  if (e.tipoTasa === "TNA") {
    const cap = e.capitalizacion ?? "mensual";
    const capDias = DIAS_CAPITALIZACION[cap];
    const m = NDxA / capDias; // capitalizaciones por año
    tea = Math.pow(1 + tasa / m, m) - 1;
  } else {
    tea = tasa;
  }
  const tem = Math.pow(1 + tea, frec / NDxA) - 1;

  // --- Montos base ---
  const CI = pCI * PV;
  const CF = pCF * PV;
  const prestamo = PV - CI + costesIniciales;
  const saldoFinanciar = prestamo - CF / Math.pow(1 + tem + pSegDes, N + 1);
  const pSegDesPer = (pSegDes * frec) / 30;
  const segRiePer = (pSegRie * PV) / NCxA;
  const coki = Math.pow(1 + cok, frec / NDxA) - 1;

  // --- Cronograma (NC = 1..N+1) ---
  const cronograma: FilaInterbank[] = [];
  let prevSFCF = 0;
  let prevQ = 0;

  for (let nc = 1; nc <= N + 1; nc++) {
    const pg: "T" | "P" | "S" = nc <= gT ? "T" : nc <= gT + gP ? "P" : "S";

    // Cuotón (cuota final)
    const sicf = nc === 1 ? CF / Math.pow(1 + tem + pSegDes, N + 1) : prevSFCF;
    const icf = -sicf * tem;
    const segDesCF = -sicf * pSegDesPer;
    const acf = nc === N + 1 ? -sicf + icf + segDesCF : 0;
    const sfcf = sicf - icf - segDesCF + acf;

    // Cuota regular
    const si = nc === 1 ? saldoFinanciar : nc <= N ? prevQ : 0;
    const interes = -si * tem;
    const segDes = -si * pSegDesPer;

    let cuota: number;
    if (nc <= N) {
      if (pg === "T") cuota = 0;
      else if (pg === "P") cuota = interes;
      else cuota = pmt(tem + pSegDesPer, N - nc + 1, si);
    } else {
      cuota = 0;
    }

    const amort =
      nc <= N && pg === "S" ? cuota - interes - segDes : 0;

    const segRie = nc <= N + 1 ? -segRiePer : 0;
    const gps = nc <= N + 1 ? -gpsPer : 0;
    const portes = nc <= N + 1 ? -portesPer : 0;
    const gasAdm = nc <= N + 1 ? -gasAdmPer : 0;

    const sf = pg === "T" ? si - interes : si + amort;

    const flujo =
      cuota +
      segRie +
      gps +
      portes +
      gasAdm +
      (pg === "T" || pg === "P" ? segDes : 0) +
      (nc === N + 1 ? acf : 0);

    cronograma.push({
      nc,
      pg,
      saldoInicialCF: sicf,
      interesCF: icf,
      amortCF: acf,
      segDesCF,
      saldoFinalCF: sfcf,
      saldoInicial: si,
      interes,
      cuota,
      amortizacion: amort,
      segDesgravamen: segDes,
      segRiesgo: segRie,
      gps,
      portes,
      gastosAdm: gasAdm,
      saldoFinal: sf,
      flujo,
    });

    prevSFCF = sfcf;
    prevQ = sf;
  }

  // --- Totales (según el Excel) ---
  const sum = (f: (r: FilaInterbank) => number) => cronograma.reduce((a, r) => a + f(r), 0);
  const sumCuota = sum((r) => r.cuota);
  const sumA = sum((r) => r.amortizacion);
  const sumACF = sum((r) => r.amortCF);
  const sumSegDes = sum((r) => r.segDesgravamen);

  const totalIntereses = -(sumCuota - sumA - sumSegDes);
  const totalAmortizacion = -sumA - sumACF;
  const totalSegDesgravamen = -sumSegDes;
  const totalSegRiesgo = -sum((r) => r.segRiesgo);
  const totalGps = -sum((r) => r.gps);
  const totalPortes = -sum((r) => r.portes);
  const totalGastosAdm = -sum((r) => r.gastosAdm);

  // --- Indicadores (flujo: periodo 0 = +préstamo; 1..N+1 = flujo de cada periodo) ---
  const flujos: number[] = [prestamo, ...cronograma.map((r) => r.flujo)];
  const tir = irr(flujos, 0.01) ?? NaN;
  const tceaVal = Number.isFinite(tir) ? Math.pow(1 + tir, NDxA / frec) - 1 : NaN;
  // VAN = Préstamo + NPV(COKi, flujos_1..N+1)   (NPV descuenta desde el periodo 1)
  const van = prestamo + descuentoDesde1(coki, cronograma.map((r) => r.flujo));

  // cuota regular representativa (primer periodo sin gracia)
  const filaS = cronograma.find((r) => r.pg === "S" && r.nc <= N);
  const cuotaRegular = filaS ? -filaS.cuota : 0;

  return {
    tea,
    tem,
    cuotaInicial: CI,
    cuotaFinal: CF,
    prestamo,
    saldoFinanciar,
    cuotaRegular,
    segRiesgoPeriodico: segRiePer,
    totalIntereses,
    totalAmortizacion,
    totalSegDesgravamen,
    totalSegRiesgo,
    totalGps,
    totalPortes,
    totalGastosAdm,
    cokMensual: coki,
    van,
    tirMensual: tir,
    tcea: tceaVal,
    cronograma,
  };
}

/** NPV al estilo Excel: descuenta values[0] un periodo (t=1), values[1] a t=2, etc. */
function descuentoDesde1(rate: number, values: number[]): number {
  let acc = 0;
  for (let i = 0; i < values.length; i++) {
    acc += values[i] / Math.pow(1 + rate, i + 1);
  }
  return acc;
}
