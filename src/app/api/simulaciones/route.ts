import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";
import { simularInterbank, type EntradaInterbank } from "@/lib/finance/interbank";
import { validarEntradaInterbank } from "@/lib/finance/validate";

function codigoSimulacion(): string {
  const d = new Date();
  const stamp =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SIM-${stamp}-${rnd}`;
}

const abs = (x: number) => Math.abs(x);

export async function POST(req: Request) {
  const session = await requireUser();
  const body = await req.json().catch(() => ({}));

  const { idCliente, idVehiculo, idEntidad, ...entrada } = body as {
    idCliente: number;
    idVehiculo: number;
    idEntidad: number;
  } & EntradaInterbank;

  const errores = validarEntradaInterbank(entrada);
  if (Object.keys(errores).length > 0) {
    return NextResponse.json({ errores }, { status: 400 });
  }
  if (!idCliente || !idVehiculo || !idEntidad) {
    return NextResponse.json(
      { error: "Selecciona cliente, vehículo y entidad financiera." },
      { status: 400 },
    );
  }

  const r = simularInterbank(entrada as EntradaInterbank);

  const totalSeguros = r.totalSegDesgravamen + r.totalSegRiesgo;
  const totalGastosPeriodicos = r.totalGps + r.totalPortes + r.totalGastosAdm;
  const costoTotal =
    r.totalIntereses + totalSeguros + totalGastosPeriodicos;

  const tipoGracia =
    (entrada.graciaTotalMeses ?? 0) > 0 && (entrada.graciaParcialMeses ?? 0) > 0
      ? "total+parcial"
      : (entrada.graciaTotalMeses ?? 0) > 0
        ? "total"
        : (entrada.graciaParcialMeses ?? 0) > 0
          ? "parcial"
          : "ninguna";

  const sim = await prisma.$transaction(async (tx) => {
    const simulacion = await tx.simulacion.create({
      data: {
        idCliente,
        idVehiculo,
        idEntidad,
        idUsuarioRegistro: session.idUsuario,
        codigoSimulacion: codigoSimulacion(),
        moneda: entrada.moneda,
        estado: "calculada",
      },
    });

    await tx.parametroCredito.create({
      data: {
        idSimulacion: simulacion.idSimulacion,
        precioVehiculo: entrada.precioVehiculo,
        cuotaInicialPorc: entrada.cuotaInicialPct,
        cuotaInicialMonto: r.cuotaInicial,
        montoFinanciado: r.prestamo,
        cuotaBalloonPorc: entrada.cuotaFinalPct,
        cuotaBalloonMonto: r.cuotaFinal,
        plazoMeses: entrada.plazoMeses,
        tipoTasa: entrada.tipoTasa,
        valorTasa: entrada.valorTasa,
        capitalizacion: entrada.capitalizacion ?? null,
        tipoGracia,
        mesesGracia:
          (entrada.graciaTotalMeses ?? 0) + (entrada.graciaParcialMeses ?? 0),
        seguroDesgravamenPorc: entrada.seguroDesgravamenPct ?? 0,
        costesIniciales: entrada.costesIniciales ?? 0,
        gpsPeriodico: entrada.gpsPeriodico ?? 0,
        portesPeriodico: entrada.portesPeriodico ?? 0,
        gastosAdmPeriodico: entrada.gastosAdmPeriodico ?? 0,
        seguroRiesgoPorc: entrada.seguroRiesgoPct ?? 0,
        cokAnualPorc: entrada.cokAnualPct ?? 0,
        graciaTotalMeses: entrada.graciaTotalMeses ?? 0,
        graciaParcialMeses: entrada.graciaParcialMeses ?? 0,
        frecuenciaPagoDias: entrada.frecuenciaPagoDias ?? 30,
        diasPorAnio: entrada.diasPorAnio ?? 360,
      },
    });

    await tx.cronogramaPago.createMany({
      data: r.cronograma.map((f) => ({
        idSimulacion: simulacion.idSimulacion,
        numeroCuota: f.nc,
        saldoInicial: abs(f.saldoInicial),
        cuota: abs(f.cuota),
        interes: abs(f.interes),
        amortizacion: abs(f.amortizacion),
        seguroDesgravamen: abs(f.segDesgravamen),
        seguroVehicular: 0,
        seguroRiesgo: abs(f.segRiesgo),
        gps: abs(f.gps),
        portes: abs(f.portes),
        gastosAdm: abs(f.gastosAdm),
        flujo: f.flujo,
        saldoInicialCf: abs(f.saldoInicialCF),
        saldoFinalCf: abs(f.saldoFinalCF),
        saldoFinal: abs(f.saldoFinal),
        esPeriodoGracia: f.pg !== "S",
        tipoGraciaAplicada: f.pg,
      })),
    });

    await tx.resultadoCredito.create({
      data: {
        idSimulacion: simulacion.idSimulacion,
        teaCalculada: r.tea * 100,
        temCalculada: r.tem * 100,
        tcea: Number.isFinite(r.tcea) ? r.tcea * 100 : 0,
        cuotaPromedio: r.cuotaRegular,
        totalIntereses: r.totalIntereses,
        totalSeguros,
        totalComisiones: totalGastosPeriodicos,
        costoTotalCredito: costoTotal,
        van: r.van,
        tir: Number.isFinite(r.tirMensual) ? r.tirMensual * 100 : 0,
        tasaDescuentoVan: r.cokMensual * 100,
        prestamo: r.prestamo,
        saldoFinanciar: r.saldoFinanciar,
        cuotaFinal: r.cuotaFinal,
        totalSegRiesgo: r.totalSegRiesgo,
        totalGastosPeriodicos,
      },
    });

    return simulacion;
  });

  await registrarAuditoria({
    idUsuario: session.idUsuario,
    tablaAfectada: "simulaciones",
    accion: "SIMULAR",
    registroAfectado: sim.idSimulacion,
    datosNuevos: { codigo: sim.codigoSimulacion, ...entrada },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, idSimulacion: sim.idSimulacion });
}
