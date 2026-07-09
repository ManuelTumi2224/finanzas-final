import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtMonto } from "@/lib/format";
import type { Moneda } from "@/lib/finance/types";

export default async function ResultadosPage({
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
    include: { cliente: true, vehiculo: true, parametros: true, resultado: true },
  });
  if (!sim || !sim.parametros || !sim.resultado) notFound();

  const moneda = (sim.moneda as Moneda) ?? "PEN";
  const p = sim.parametros;
  const r = sim.resultado;
  const pct = (v: number) => `${v.toFixed(4)}%`;
  const gracia = `${p.graciaTotalMeses} total + ${p.graciaParcialMeses} parcial`;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resultados Financieros</h1>
          <p className="text-sm text-slate-500">{sim.codigoSimulacion} · Compra Inteligente</p>
        </div>
        <Link href={`/simulaciones/${idSimulacion}`}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          ← Ver cronograma
        </Link>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Cuota regular" value={fmtMonto(Number(r.cuotaPromedio), moneda)} color="brand" />
        <Kpi label="TCEA" value={pct(Number(r.tcea))} color="emerald" />
        <Kpi label="VAN (a COK)" value={fmtMonto(Number(r.van), moneda)} color="violet" />
        <Kpi label="TIR (mensual)" value={pct(Number(r.tir))} color="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Resumen del crédito</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Precio del vehículo" value={fmtMonto(Number(p.precioVehiculo), moneda)} />
            <Row label={`Cuota inicial (${Number(p.cuotaInicialPorc)}%)`} value={fmtMonto(Number(p.cuotaInicialMonto), moneda)} />
            <Row label="(+) Costes iniciales" value={fmtMonto(Number(p.costesIniciales ?? 0), moneda)} />
            <Row label="Monto del préstamo" value={fmtMonto(Number(r.prestamo ?? p.montoFinanciado), moneda)} strong />
            <Row label="Saldo a financiar con cuotas" value={fmtMonto(Number(r.saldoFinanciar ?? 0), moneda)} />
            <Row label={`Cuota final / Balloon (${Number(p.cuotaBalloonPorc)}%)`} value={fmtMonto(Number(r.cuotaFinal ?? p.cuotaBalloonMonto), moneda)} />
            <Row label="Plazo" value={`${p.plazoMeses} cuotas + balloon`} />
            <Row label="Tipo de tasa" value={`${p.tipoTasa} ${Number(p.valorTasa)}%${p.capitalizacion ? ` (cap. ${p.capitalizacion})` : ""}`} />
            <Row label="Periodos de gracia" value={gracia} />
            <div className="my-2 border-t border-slate-100" />
            <Row label="TEA / TEM" value={`${Number(r.teaCalculada).toFixed(4)}% / ${Number(r.temCalculada).toFixed(4)}%`} />
            <Row label="COK (mensual)" value={pct(Number(r.tasaDescuentoVan))} />
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Costos totales del crédito</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Total intereses" value={fmtMonto(Number(r.totalIntereses), moneda)} />
            <Row label="Seguro de desgravamen + riesgo" value={fmtMonto(Number(r.totalSeguros), moneda)} />
            <Row label="Seguro de riesgo (incluido)" value={fmtMonto(Number(r.totalSegRiesgo ?? 0), moneda)} />
            <Row label="Gastos periódicos (GPS, portes, adm.)" value={fmtMonto(Number(r.totalGastosPeriodicos ?? r.totalComisiones), moneda)} />
            <div className="my-2 border-t border-slate-100" />
            <Row label="Costo total del crédito" value={fmtMonto(Number(r.costoTotalCredito), moneda)} strong accent />
          </dl>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-700">Interpretación</h3>
          <ul className="space-y-3 text-sm">
            <Interp titulo="La TCEA es el costo efectivo anual real.">
              Incluye intereses, seguros (desgravamen y riesgo) y gastos periódicos. A menor TCEA, menor costo.
            </Interp>
            <Interp titulo="El VAN se descuenta a la tasa del inversionista (COK).">
              Compara el préstamo recibido con el valor presente de los pagos. VAN &gt; 0 indica conveniencia frente al COK.
            </Interp>
            <Interp titulo="La cuota final (balloon) se financia como cuotón.">
              Capitaliza su interés aparte y se paga en el periodo adicional, dejando el saldo en cero.
            </Interp>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: "brand" | "emerald" | "violet" | "amber" }) {
  const bg = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  }[color];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg px-2 py-1 text-xs font-medium ${bg}`}>{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`${strong ? "font-semibold" : ""} ${accent ? "text-brand-600" : "text-slate-800"} text-right`}>{value}</dd>
    </div>
  );
}
function Interp({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 text-emerald-500">✓</span>
      <div>
        <p className="font-medium text-slate-800">{titulo}</p>
        <p className="text-slate-500">{children}</p>
      </div>
    </li>
  );
}
