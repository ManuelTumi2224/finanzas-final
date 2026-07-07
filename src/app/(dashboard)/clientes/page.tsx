import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtMonto } from "@/lib/format";

export default async function ClientesPage() {
  await requireUser();
  const clientes = await prisma.cliente.findMany({
    orderBy: { fechaRegistro: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">Solicitantes registrados</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nuevo cliente
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">DNI</th>
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Teléfono</th>
              <th className="px-4 py-3 text-right font-medium">Ingresos</th>
              <th className="px-4 py-3 text-left font-medium">Ocupación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
            {clientes.map((c) => (
              <tr key={c.idCliente} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.dni}</td>
                <td className="px-4 py-3 text-slate-800">
                  {c.nombres} {c.apellidos}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.telefono ?? "—"}</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {c.ingresosMensuales ? fmtMonto(Number(c.ingresosMensuales)) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.ocupacion ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
