import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtMonto } from "@/lib/format";
import type { Moneda } from "@/lib/finance/types";

export default async function PlanPagosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const idSimulacion = Number(id);
  if (Number.isNaN(idSimulacion)) notFound();

  const sim = await prisma.simulacion.findUnique({
    where: { idSimulacion },
    include: {
      cliente: true,
      vehiculo: true,
      parametros: true,
      cronograma: { orderBy: { numeroCuota: "asc" } },
      resultado: true,
    },
  });
  if (!sim || !sim.parametros) notFound();

  const moneda = (sim.moneda as Moneda) ?? "PEN";
  const p = sim.parametros;
  const ultimo = p.plazoMeses + 1;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Simulación del Plan de Pagos</h1>
          <p className="text-sm text-slate-500">{sim.codigoSimulacion} · Compra Inteligente</p>
        </div>
        <Link href={`/simulaciones/${idSimulacion}/resultados`}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700">
          Ver resultados financieros →
        </Link>
      </div>

      <div className="mb-5 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
        <Info label="Cliente" value={`${sim.cliente.nombres} ${sim.cliente.apellidos}`} />
        <Info label="Vehículo" value={`${sim.vehiculo.marca} ${sim.vehiculo.modelo}`} />
        <Info label="Moneda" value={moneda === "PEN" ? "Soles (S/)" : "Dólares (US$)"} />
        <Info label="Monto del préstamo" value={fmtMonto(Number(p.montoFinanciado), moneda)} accent />
        <Info label="Plazo" value={`${p.plazoMeses} cuotas (+ balloon)`} />
        <Info label="Cuota final (Balloon)" value={fmtMonto(Number(p.cuotaBalloonMonto), moneda)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-700">Cronograma de pagos</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Leyenda color="bg-violet-100 text-violet-700" t="Gracia total" />
            <Leyenda color="bg-sky-100 text-sky-700" t="Gracia parcial" />
            <Leyenda color="bg-emerald-100 text-emerald-700" t="Cuota normal" />
            <Leyenda color="bg-amber-100 text-amber-700" t="Balloon (cuota final)" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-right text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <Th className="text-center">N°</Th>
                <Th>Saldo inicial</Th>
                <Th>Interés</Th>
                <Th>Cuota</Th>
                <Th>Amort.</Th>
                <Th>Seg. Desg.</Th>
                <Th>Seg. Riesgo</Th>
                <Th>Otros gastos</Th>
                <Th>Saldo final</Th>
                <Th>Saldo cuotón</Th>
                <Th className="text-center">Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sim.cronograma.map((f) => {
                const otros = Number(f.gps ?? 0) + Number(f.portes ?? 0) + Number(f.gastosAdm ?? 0);
                return (
                  <tr key={f.idCronograma} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-center text-slate-500">{f.numeroCuota}</td>
                    <Td>{fmtMonto(Number(f.saldoInicial), moneda)}</Td>
                    <Td>{fmtMonto(Number(f.interes), moneda)}</Td>
                    <td className="px-3 py-2 font-medium text-slate-800">{fmtMonto(Number(f.cuota), moneda)}</td>
                    <Td>{fmtMonto(Number(f.amortizacion), moneda)}</Td>
                    <Td>{fmtMonto(Number(f.seguroDesgravamen), moneda)}</Td>
                    <Td>{fmtMonto(Number(f.seguroRiesgo ?? 0), moneda)}</Td>
                    <Td>{fmtMonto(otros, moneda)}</Td>
                    <Td>{fmtMonto(Number(f.saldoFinal), moneda)}</Td>
                    <Td>{fmtMonto(Number(f.saldoFinalCf ?? 0), moneda)}</Td>
                    <td className="px-3 py-2 text-center">
                      <Estado pg={f.tipoGraciaAplicada} balloon={f.numeroCuota === ultimo} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-sm font-medium ${accent ? "text-brand-600" : "text-slate-800"}`}>{value}</div>
    </div>
  );
}
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-slate-600">{children}</td>;
}
function Leyenda({ color, t }: { color: string; t: string }) {
  return <span className={`rounded-full px-2 py-0.5 ${color}`}>{t}</span>;
}
function Estado({ pg, balloon }: { pg: string | null; balloon: boolean }) {
  if (balloon)
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Balloon</span>;
  if (pg === "T")
    return <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Gracia total</span>;
  if (pg === "P")
    return <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">Gracia parcial</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Normal</span>;
}
