// Motor de simulacion: cronograma del metodo frances vencido con balloon,
// periodos de gracia y calculo de indicadores (VAN, TIR, TCEA).
//
// IMPORTANTE: el pseudocodigo del informe (7.2) calcula la cuota una sola vez
// con el plazo completo N. Al validarlo contra los resultados esperados de la
// seccion 6.4.3 NO cuadra en los casos con gracia. La forma correcta -que si
// reproduce los valores esperados- consiste en:
//   1) Recorrer los meses de gracia haciendo evolucionar el saldo
//      (parcial: paga interes, saldo constante; total: saldo crece con el interes).
//   2) Al terminar la gracia, RECALCULAR la cuota francesa sobre los meses
//      restantes (N - g) para amortizar del saldo actual hasta el balloon.
// Verificado: TNA-Soles-parcial -> S/2,152 (esperado 2,151.76);
//             TEA-USD-total -> US$499.75 (esperado 499.79).

import { irr, npv, tcea } from "./indicators";
import { teaToTem, tnaToTea } from "./rates";
import type {
  EntradaSimulacion,
  FilaCronograma,
  ResultadoSimulacion,
  TipoGracia,
} from "./types";

/**
 * Cuota constante del metodo frances con valor final (balloon).
 * C = (saldo - MB/(1+i)^n) / ((1 - (1+i)^-n) / i)
 */
export function cuotaFrancesaConBalloon(
  saldo: number,
  montoBalloon: number,
  tem: number,
  n: number,
): number {
  if (n <= 0) return 0;
  if (tem === 0) return (saldo - montoBalloon) / n;
  const factorAnualidad = (1 - Math.pow(1 + tem, -n)) / tem;
  const vpBalloon = montoBalloon / Math.pow(1 + tem, n);
  return (saldo - vpBalloon) / factorAnualidad;
}

/** Redondea a 2 decimales (centavos). */
function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

export function simular(entrada: EntradaSimulacion): ResultadoSimulacion {
  const {
    precioVehiculo: pv,
    cuotaInicialPct,
    balloonPct,
    plazoMeses: n,
    tipoTasa,
    valorTasa,
    capitalizacion,
    tipoGracia,
    mesesGracia: g,
    seguroDesgravamenPct,
    seguroVehicular,
  } = entrada;

  // --- Calculos iniciales (6.3.1 - 6.3.3) ---
  const cuotaInicial = pv * (cuotaInicialPct / 100);
  const montoFinanciado = pv - cuotaInicial;
  const montoBalloon = pv * (balloonPct / 100);

  // --- Conversion de tasas (6.3.4 - 6.3.5) ---
  let tea: number;
  if (tipoTasa === "TEA") {
    tea = valorTasa / 100;
  } else {
    const cap = capitalizacion ?? "mensual";
    tea = tnaToTea(valorTasa / 100, cap);
  }
  const tem = teaToTem(tea);
  const segDesTasa = seguroDesgravamenPct / 100;

  const cronograma: FilaCronograma[] = [];
  let saldo = montoFinanciado;

  // --- Fase de gracia (meses 1..g) ---
  const graciaAplica = tipoGracia !== "ninguna" && g > 0;
  for (let mes = 1; mes <= g && graciaAplica; mes++) {
    const saldoInicial = saldo;
    const interes = saldo * tem;
    const segDes = saldo * segDesTasa;

    if (tipoGracia === "total") {
      // No paga cuota; el interes se capitaliza al saldo.
      saldo = saldo + interes;
      cronograma.push({
        mes,
        saldoInicial,
        interes,
        amortizacion: 0,
        seguroDesgravamen: 0,
        seguroVehicular: 0,
        cuotaTotal: 0,
        saldoFinal: saldo,
        esGracia: true,
        tipoGraciaAplicada: "total",
      });
    } else {
      // Gracia parcial: paga solo interes (+ seguros); el saldo no cambia.
      cronograma.push({
        mes,
        saldoInicial,
        interes,
        amortizacion: 0,
        seguroDesgravamen: segDes,
        seguroVehicular,
        cuotaTotal: interes + segDes + seguroVehicular,
        saldoFinal: saldo,
        esGracia: true,
        tipoGraciaAplicada: "parcial",
      });
    }
  }

  // --- Tramo de amortizacion: recalcular cuota sobre los meses restantes ---
  const mesesRestantes = n - (graciaAplica ? g : 0);
  const cuotaBase = cuotaFrancesaConBalloon(saldo, montoBalloon, tem, mesesRestantes);

  for (let mes = (graciaAplica ? g : 0) + 1; mes <= n; mes++) {
    const saldoInicial = saldo;
    const interes = saldo * tem;
    const segDes = saldo * segDesTasa;
    const amortizacion = cuotaBase - interes;
    saldo = saldo - amortizacion;

    let cuotaTotal = cuotaBase + segDes + seguroVehicular;

    // Ultimo periodo: se paga el balloon; el saldo debe quedar en cero.
    if (mes === n) {
      cuotaTotal += montoBalloon;
      saldo = 0;
    }

    cronograma.push({
      mes,
      saldoInicial,
      interes,
      amortizacion,
      seguroDesgravamen: segDes,
      seguroVehicular,
      cuotaTotal,
      saldoFinal: saldo,
      esGracia: false,
      tipoGraciaAplicada: null as TipoGracia | null,
    });
  }

  // --- Totales ---
  const totalIntereses = cronograma.reduce((s, f) => s + f.interes, 0);
  const totalSeguros = cronograma.reduce(
    (s, f) => s + f.seguroDesgravamen + f.seguroVehicular,
    0,
  );
  // Costo total del credito = intereses + seguros (el balloon es devolucion de capital).
  const costoTotalCredito = totalIntereses + totalSeguros;

  // --- Flujos de caja del deudor (7.3): periodo 0 = +MF; 1..N = -pago_t ---
  const flujos: number[] = [montoFinanciado];
  for (const f of cronograma) {
    flujos.push(-f.cuotaTotal);
  }

  // TIR mensual y TCEA.
  const tirMensual = irr(flujos, tem) ?? NaN;
  const tceaValor = Number.isFinite(tirMensual) ? tcea(tirMensual) : NaN;

  // VAN: descuenta los pagos a la tasa indicada (por defecto la TEM).
  const rDesc =
    entrada.tasaDescuentoVANPct != null
      ? entrada.tasaDescuentoVANPct / 100
      : tem;
  const van = npv(rDesc, flujos);

  return {
    cuotaInicial: round2(cuotaInicial),
    montoFinanciado: round2(montoFinanciado),
    montoBalloon: round2(montoBalloon),
    tea,
    tem,
    cuotaBase: round2(cuotaBase),
    cronograma: cronograma.map((f) => ({
      ...f,
      saldoInicial: round2(f.saldoInicial),
      interes: round2(f.interes),
      amortizacion: round2(f.amortizacion),
      seguroDesgravamen: round2(f.seguroDesgravamen),
      seguroVehicular: round2(f.seguroVehicular),
      cuotaTotal: round2(f.cuotaTotal),
      saldoFinal: round2(f.saldoFinal),
    })),
    totalIntereses: round2(totalIntereses),
    totalSeguros: round2(totalSeguros),
    costoTotalCredito: round2(costoTotalCredito),
    van: round2(van),
    tirMensual,
    tcea: tceaValor,
  };
}
