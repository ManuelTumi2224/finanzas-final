// Validacion del motor financiero contra los resultados esperados del informe
// (seccion 6.4.3). Los valores esperados provienen de la matriz de Excel del
// equipo; se admiten pequenas tolerancias por redondeo de tasas.
import { describe, expect, it } from "vitest";
import { simular } from "./simulate";
import type { EntradaSimulacion } from "./types";

interface CasoEsperado {
  cuota: number;
  vanTem: number;
  tirMensualPct: number;
  tceaPct: number;
  costoTotal: number;
}

const casos: { nombre: string; entrada: EntradaSimulacion; esperado: CasoEsperado }[] = [
  {
    nombre: "TEA - Soles - Sin gracia",
    entrada: {
      moneda: "PEN",
      precioVehiculo: 80000,
      cuotaInicialPct: 20,
      balloonPct: 30,
      plazoMeses: 36,
      tipoTasa: "TEA",
      valorTasa: 14.5,
      tipoGracia: "ninguna",
      mesesGracia: 0,
      seguroDesgravamenPct: 0.05,
      seguroVehicular: 150,
    },
    esperado: { cuota: 1632.02, vanTem: -5107.66, tirMensualPct: 1.4995, tceaPct: 19.5546, costoTotal: 24979.08 },
  },
  {
    nombre: "TEA - Dolares - Gracia total",
    entrada: {
      moneda: "USD",
      precioVehiculo: 28000,
      cuotaInicialPct: 15,
      balloonPct: 35,
      plazoMeses: 48,
      tipoTasa: "TEA",
      valorTasa: 13.2,
      tipoGracia: "total",
      mesesGracia: 2,
      seguroDesgravamenPct: 0.04,
      seguroVehicular: 45,
    },
    esperado: { cuota: 499.79, vanTem: -1867.33, tirMensualPct: 1.3021, tceaPct: 16.7944, costoTotal: 11387.26 },
  },
  {
    nombre: "TNA - Soles - Gracia parcial (cap. mensual)",
    entrada: {
      moneda: "PEN",
      precioVehiculo: 95000,
      cuotaInicialPct: 15,
      balloonPct: 30,
      plazoMeses: 36,
      tipoTasa: "TNA",
      valorTasa: 12,
      capitalizacion: "mensual",
      tipoGracia: "parcial",
      mesesGracia: 3,
      seguroDesgravamenPct: 0.05,
      seguroVehicular: 160,
    },
    esperado: { cuota: 2151.76, vanTem: -5727.25, tirMensualPct: 1.3125, tceaPct: 16.9383, costoTotal: 27999.56 },
  },
  {
    nombre: "TNA - Dolares - Gracia parcial (cap. diaria)",
    entrada: {
      moneda: "USD",
      precioVehiculo: 25000,
      cuotaInicialPct: 10,
      balloonPct: 40,
      plazoMeses: 48,
      tipoTasa: "TNA",
      valorTasa: 11.5,
      capitalizacion: "diaria",
      tipoGracia: "parcial",
      mesesGracia: 3,
      seguroDesgravamenPct: 0.04,
      seguroVehicular: 40,
    },
    esperado: { cuota: 439.88, vanTem: -1802.49, tirMensualPct: 1.2274, tceaPct: 15.7643, costoTotal: 10194.38 },
  },
];

describe("Motor financiero AutoFinanZ - casos de la seccion 6.4.3", () => {
  for (const c of casos) {
    describe(c.nombre, () => {
      const r = simular(c.entrada);

      it("cuota base coincide (±1.5)", () => {
        expect(Math.abs(r.cuotaBase - c.esperado.cuota)).toBeLessThanOrEqual(1.5);
      });
      it("TIR mensual coincide (±0.02 pp)", () => {
        expect(Math.abs(r.tirMensual * 100 - c.esperado.tirMensualPct)).toBeLessThanOrEqual(0.02);
      });
      it("TCEA coincide (±0.05 pp)", () => {
        expect(Math.abs(r.tcea * 100 - c.esperado.tceaPct)).toBeLessThanOrEqual(0.05);
      });
      it("VAN (descuento a TEM) coincide (±40)", () => {
        expect(Math.abs(r.van - c.esperado.vanTem)).toBeLessThanOrEqual(40);
      });
      it("costo total del credito coincide (±60)", () => {
        expect(Math.abs(r.costoTotalCredito - c.esperado.costoTotal)).toBeLessThanOrEqual(60);
      });
      it("el saldo final del ultimo mes es 0", () => {
        expect(r.cronograma[r.cronograma.length - 1].saldoFinal).toBe(0);
      });
    });
  }
});
