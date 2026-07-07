// Registro de auditoria: "registrar todas las operaciones realizadas" (enunciado
// del trabajo y tabla auditoria, seccion 8.2.10).
import { prisma } from "./prisma";

interface RegistroAuditoria {
  idUsuario: number;
  tablaAfectada: string;
  accion: string; // INSERT | UPDATE | DELETE | LOGIN | LOGOUT | SIMULAR
  registroAfectado?: number;
  datosNuevos?: unknown;
  datosAnteriores?: unknown;
  ipAddress?: string | null;
}

export async function registrarAuditoria(r: RegistroAuditoria): Promise<void> {
  try {
    await prisma.auditoria.create({
      data: {
        idUsuario: r.idUsuario,
        tablaAfectada: r.tablaAfectada,
        accion: r.accion,
        registroAfectado: r.registroAfectado ?? null,
        datosNuevos: r.datosNuevos ? JSON.stringify(r.datosNuevos) : null,
        datosAnteriores: r.datosAnteriores
          ? JSON.stringify(r.datosAnteriores)
          : null,
        ipAddress: r.ipAddress ?? null,
      },
    });
  } catch (e) {
    // La auditoria no debe romper la operacion principal.
    console.error("Error registrando auditoria:", e);
  }
}
