// Valida el motor Interbank contra el modelo Excel del docente (oráculo generado
// desde la hoja "Frances"). Compara resumen + las 38 filas del cronograma.
import { describe, expect, it } from "vitest";
import oracle from "./__oracle_interbank.json";
import { simularInterbank, type EntradaInterbank } from "./interbank";

const entrada: EntradaInterbank = {
  moneda: "USD",
  precioVehiculo: 16000,
  cuotaInicialPct: 20,
  cuotaFinalPct: 40,
  plazoMeses: 36,
  tipoTasa: "TNA",
  valorTasa: 15,
  capitalizacion: "diaria",
  frecuenciaPagoDias: 30,
  diasPorAnio: 360,
  costesIniciales: 175, // notariales 100 + registrales 75
  gpsPeriodico: 20,
  portesPeriodico: 3.5,
  gastosAdmPeriodico: 3.5,
  seguroDesgravamenPct: 0.049, // => 0.00049 (valor exacto del Excel del docente)
  seguroRiesgoPct: 0.3, // => 0.003
  cokAnualPct: 50, // => 0.5
  graciaTotalMeses: 3,
  graciaParcialMeses: 3,
};

const r = simularInterbank(entrada);
const o = oracle as {
  resumen: Record<string, number>;
  cronograma: Record<string, number>[];
};

const near = (a: number, b: number, tol = 0.02) => Math.abs(a - b) <= tol;

describe("Motor Interbank vs modelo Excel del docente", () => {
  it("TEA y TEM", () => {
    expect(near(r.tea, o.resumen.TEA, 1e-4)).toBe(true);
    expect(near(r.tem, o.resumen.TEM, 1e-4)).toBe(true);
  });
  it("Préstamo, saldo a financiar, CI y CF", () => {
    expect(near(r.cuotaInicial, o.resumen.CI)).toBe(true);
    expect(near(r.cuotaFinal, o.resumen.CF)).toBe(true);
    expect(near(r.prestamo, o.resumen.Prestamo)).toBe(true);
    expect(near(r.saldoFinanciar, o.resumen.Saldo)).toBe(true);
  });
  it("Cuota regular ≈ 379.16", () => {
    expect(near(r.cuotaRegular, 379.1584, 0.02)).toBe(true);
  });
  it("Totales (intereses, seguros, gastos)", () => {
    expect(near(r.totalIntereses, o.resumen.Intereses, 0.1)).toBe(true);
    expect(near(r.totalSegDesgravamen, o.resumen.SegDesTot, 0.1)).toBe(true);
    expect(near(r.totalSegRiesgo, o.resumen.SegRieTot, 0.1)).toBe(true);
    expect(near(r.totalGps, o.resumen.GPStot, 0.1)).toBe(true);
    expect(near(r.totalPortes, o.resumen.PortesTot, 0.1)).toBe(true);
    expect(near(r.totalGastosAdm, o.resumen.GasAdmTot, 0.1)).toBe(true);
  });
  it("Indicadores: COKi, TIR, TCEA, VAN", () => {
    expect(near(r.cokMensual, o.resumen.COKi, 1e-4)).toBe(true);
    expect(near(r.tirMensual, o.resumen.TIR, 1e-4)).toBe(true);
    expect(near(r.tcea, o.resumen.TCEA, 1e-3)).toBe(true);
    expect(near(r.van, o.resumen.VAN, 0.5)).toBe(true);
  });
  it("Saldo final del último periodo = 0 (cuotón liquidado)", () => {
    expect(near(r.cronograma[r.cronograma.length - 1].saldoFinalCF, 0, 0.01)).toBe(true);
    expect(near(r.cronograma[36].saldoFinal, 0, 0.01)).toBe(true);
  });

  // Comparación fila por fila (cuota regular, interés, saldo final y flujo)
  describe("Cronograma fila por fila", () => {
    for (let i = 1; i < 38; i++) {
      it(`periodo ${i}`, () => {
        const row = r.cronograma[i - 1];
        const exp = o.cronograma[i]; // oracle[0] es el periodo 0
        expect(near(row.saldoInicial, exp.SI, 0.05)).toBe(true);
        expect(near(row.interes, exp.I, 0.05)).toBe(true);
        expect(near(row.cuota, exp.Cuota, 0.05)).toBe(true);
        expect(near(row.saldoFinal, exp.SF, 0.05)).toBe(true);
        expect(near(row.flujo, exp.Flujo, 0.05)).toBe(true);
        expect(near(row.saldoFinalCF, exp.SFCF, 0.05)).toBe(true);
      });
    }
  });
});
