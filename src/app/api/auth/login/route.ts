import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { registrarAuditoria } from "@/lib/audit";

export async function POST(req: Request) {
  const { usuario, password } = await req.json().catch(() => ({}));

  if (!usuario || !password) {
    return NextResponse.json(
      { error: "Ingresa usuario y contraseña." },
      { status: 400 },
    );
  }

  // El login acepta nombre de usuario o correo.
  const user = await prisma.usuario.findFirst({
    where: {
      OR: [{ nombreUsuario: usuario }, { correo: usuario }],
      estado: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Credenciales inválidas." },
      { status: 401 },
    );
  }

  await prisma.usuario.update({
    where: { idUsuario: user.idUsuario },
    data: { ultimoLogin: new Date() },
  });

  await createSession({
    idUsuario: user.idUsuario,
    nombreUsuario: user.nombreUsuario,
    nombreCompleto: user.nombreCompleto,
    tipoUsuario: user.tipoUsuario,
  });

  await registrarAuditoria({
    idUsuario: user.idUsuario,
    tablaAfectada: "usuarios",
    accion: "LOGIN",
    registroAfectado: user.idUsuario,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
