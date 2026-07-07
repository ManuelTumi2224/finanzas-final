import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await requireUser();
  const b = await req.json().catch(() => ({}));

  if (!b.dni || !b.nombres || !b.apellidos) {
    return NextResponse.json(
      { error: "DNI, nombres y apellidos son obligatorios." },
      { status: 400 },
    );
  }
  if (!/^\d{8}$/.test(String(b.dni))) {
    return NextResponse.json({ error: "El DNI debe tener 8 dígitos." }, { status: 400 });
  }

  const existe = await prisma.cliente.findUnique({ where: { dni: String(b.dni) } });
  if (existe) {
    return NextResponse.json({ error: "Ya existe un cliente con ese DNI." }, { status: 409 });
  }

  const cliente = await prisma.cliente.create({
    data: {
      dni: String(b.dni),
      nombres: b.nombres,
      apellidos: b.apellidos,
      telefono: b.telefono || null,
      correo: b.correo || null,
      direccion: b.direccion || null,
      estadoCivil: b.estadoCivil || null,
      ocupacion: b.ocupacion || null,
      historialCrediticio: b.historialCrediticio || null,
      ingresosMensuales:
        b.ingresosMensuales != null && b.ingresosMensuales !== ""
          ? Number(b.ingresosMensuales)
          : null,
    },
  });

  await registrarAuditoria({
    idUsuario: session.idUsuario,
    tablaAfectada: "clientes",
    accion: "INSERT",
    registroAfectado: cliente.idCliente,
    datosNuevos: { dni: cliente.dni, nombres: cliente.nombres },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, idCliente: cliente.idCliente });
}
