import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtMonto } from "@/lib/format";
import type { Moneda } from "@/lib/finance/types";

export default async function VehiculosPage() {
  await requireUser();
  const vehiculos = await prisma.vehiculo.findMany({
    orderBy: { idVehiculo: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehículos</h1>
          <p className="text-sm text-slate-500">Catálogo de vehículos para financiar</p>
        </div>
        <Link
          href="/vehiculos/nuevo"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nuevo vehículo
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Marca / Modelo</th>
              <th className="px-4 py-3 text-center font-medium">Año</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-left font-medium">N° Serie</th>
              <th className="px-4 py-3 text-center font-medium">Disponible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehiculos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay vehículos registrados.
                </td>
              </tr>
            )}
            {vehiculos.map((v) => (
              <tr key={v.idVehiculo} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">
                  {v.marca} {v.modelo} {v.version ?? ""}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{v.anio}</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {fmtMonto(Number(v.precioVenta), (v.moneda as Moneda) ?? "PEN")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.numeroSerie}</td>
                <td className="px-4 py-3 text-center">
                  {v.estadoDisponibilidad ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Sí</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
