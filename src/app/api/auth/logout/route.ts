import { NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/session";
import { registrarAuditoria } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  if (session) {
    await registrarAuditoria({
      idUsuario: session.idUsuario,
      tablaAfectada: "usuarios",
      accion: "LOGOUT",
      registroAfectado: session.idUsuario,
    });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
