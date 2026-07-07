import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await requireUser();
  const b = await req.json().catch(() => ({}));

  if (!b.marca || !b.modelo || !b.anio || !b.precioVenta || !b.numeroSerie) {
    return NextResponse.json(
      { error: "Marca, modelo, año, precio y N° de serie son obligatorios." },
      { status: 400 },
    );
  }

  const existe = await prisma.vehiculo.findUnique({
    where: { numeroSerie: String(b.numeroSerie) },
  });
  if (existe) {
    return NextResponse.json(
      { error: "Ya existe un vehículo con ese N° de serie." },
      { status: 409 },
    );
  }

  const vehiculo = await prisma.vehiculo.create({
    data: {
      marca: b.marca,
      modelo: b.modelo,
      anio: Number(b.anio),
      version: b.version || null,
      precioVenta: Number(b.precioVenta),
      moneda: b.moneda || "PEN",
      color: b.color || null,
      kilometraje: b.kilometraje ? Number(b.kilometraje) : null,
      numeroSerie: String(b.numeroSerie),
      concesionario: b.concesionario || null,
      tipoCombustible: b.tipoCombustible || null,
      transmision: b.transmision || null,
      estadoVehiculo: b.estadoVehiculo || null,
      placa: b.placa || null,
    },
  });

  await registrarAuditoria({
    idUsuario: session.idUsuario,
    tablaAfectada: "vehiculos",
    accion: "INSERT",
    registroAfectado: vehiculo.idVehiculo,
    datosNuevos: { marca: vehiculo.marca, modelo: vehiculo.modelo },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, idVehiculo: vehiculo.idVehiculo });
}
