import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtMonto } from "@/lib/format";
import type { Moneda } from "@/lib/finance/types";

export default async function SimulacionesPage() {
  await requireUser();
  const sims = await prisma.simulacion.findMany({
    orderBy: { fechaSimulacion: "desc" },
    include: { cliente: true, vehiculo: true, parametros: true, resultado: true },
    take: 100,
  });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Simulaciones</h1>
          <p className="text-sm text-slate-500">Historial de simulaciones registradas</p>
        </div>
        <Link
          href="/simulaciones/nueva"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nueva simulación
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Código</th>
              <th className="px-4 py-3 text-left font-medium">Cliente</th>
              <th className="px-4 py-3 text-left font-medium">Vehículo</th>
              <th className="px-4 py-3 text-right font-medium">Financiado</th>
              <th className="px-4 py-3 text-right font-medium">TCEA</th>
              <th className="px-4 py-3 text-center font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sims.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No hay simulaciones aún.{" "}
                  <Link href="/simulaciones/nueva" className="text-brand-600 underline">
                    Crea la primera
                  </Link>
                  .
                </td>
              </tr>
            )}
            {sims.map((s) => {
              const moneda = (s.moneda as Moneda) ?? "PEN";
              return (
                <tr key={s.idSimulacion} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {s.codigoSimulacion}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {s.cliente.nombres} {s.cliente.apellidos}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.vehiculo.marca} {s.vehiculo.modelo}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {s.parametros
                      ? fmtMonto(Number(s.parametros.montoFinanciado), moneda)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">
                    {s.resultado ? `${Number(s.resultado.tcea).toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/simulaciones/${s.idSimulacion}`}
                      className="text-brand-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
