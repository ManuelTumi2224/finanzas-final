import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";
import { simular } from "@/lib/finance/simulate";
import { validarEntrada } from "@/lib/finance/validate";
import type { EntradaSimulacion } from "@/lib/finance/types";

function codigoSimulacion(): string {
  const d = new Date();
  const stamp =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SIM-${stamp}-${rnd}`;
}

export async function POST(req: Request) {
  const session = await requireUser();
  const body = await req.json().catch(() => ({}));

  const { idCliente, idVehiculo, idEntidad, ...entrada } = body as {
    idCliente: number;
    idVehiculo: number;
    idEntidad: number;
  } & EntradaSimulacion;

  // Validacion financiera.
  const errores = validarEntrada(entrada);
  if (Object.keys(errores).length > 0) {
    return NextResponse.json({ errores }, { status: 400 });
  }
  if (!idCliente || !idVehiculo || !idEntidad) {
    return NextResponse.json(
      { error: "Selecciona cliente, vehículo y entidad financiera." },
      { status: 400 },
    );
  }

  // Calculo con el motor financiero.
  const r = simular(entrada as EntradaSimulacion);

  const cuotaPromedio =
    r.cronograma.reduce((s, f) => s + f.cuotaTotal, 0) / r.cronograma.length;

  // Persistencia transaccional de toda la operacion.
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
        montoFinanciado: r.montoFinanciado,
        cuotaBalloonPorc: entrada.balloonPct,
        cuotaBalloonMonto: r.montoBalloon,
        plazoMeses: entrada.plazoMeses,
        tipoTasa: entrada.tipoTasa,
        valorTasa: entrada.valorTasa,
        capitalizacion: entrada.capitalizacion ?? null,
        tipoGracia: entrada.tipoGracia,
        mesesGracia: entrada.mesesGracia,
        seguroDesgravamenPorc: entrada.seguroDesgravamenPct,
        seguroVehicularMonto: entrada.seguroVehicular,
      },
    });

    await tx.cronogramaPago.createMany({
      data: r.cronograma.map((f) => ({
        idSimulacion: simulacion.idSimulacion,
        numeroCuota: f.mes,
        saldoInicial: f.saldoInicial,
        cuota: f.cuotaTotal,
        interes: f.interes,
        amortizacion: f.amortizacion,
        seguroDesgravamen: f.seguroDesgravamen,
        seguroVehicular: f.seguroVehicular,
        saldoFinal: f.saldoFinal,
        esPeriodoGracia: f.esGracia,
        tipoGraciaAplicada: f.tipoGraciaAplicada,
      })),
    });

    await tx.resultadoCredito.create({
      data: {
        idSimulacion: simulacion.idSimulacion,
        teaCalculada: r.tea * 100,
        temCalculada: r.tem * 100,
        tcea: Number.isFinite(r.tcea) ? r.tcea * 100 : 0,
        cuotaPromedio,
        totalIntereses: r.totalIntereses,
        totalSeguros: r.totalSeguros,
        costoTotalCredito: r.costoTotalCredito,
        van: r.van,
        tir: Number.isFinite(r.tirMensual) ? r.tirMensual * 100 : 0,
        tasaDescuentoVan:
          (entrada.tasaDescuentoVANPct ?? r.tem * 100) as number,
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
