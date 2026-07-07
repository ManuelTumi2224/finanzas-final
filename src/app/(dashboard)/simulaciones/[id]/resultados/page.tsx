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

  const montoTotalPagar =
    Number(r.costoTotalCredito) + Number(p.montoFinanciado);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resultados Financieros
          </h1>
          <p className="text-sm text-slate-500">
            {sim.codigoSimulacion} · Resultados financieros
          </p>
        </div>
        <Link
          href={`/simulaciones/${idSimulacion}`}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Ver cronograma
        </Link>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Cuota mensual (aprox.)"
          value={fmtMonto(Number(r.cuotaPromedio), moneda)}
          color="brand"
        />
        <Kpi label="TCEA" value={pct(Number(r.tcea))} color="emerald" />
        <Kpi label="VAN" value={fmtMonto(Number(r.van), moneda)} color="violet" />
        <Kpi label="TIR (mensual)" value={pct(Number(r.tir))} color="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Resumen */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Resumen del crédito
          </h3>
          <dl className="space-y-2 text-sm">
            <Row label="Precio del vehículo" value={fmtMonto(Number(p.precioVehiculo), moneda)} />
            <Row label={`Cuota inicial (${Number(p.cuotaInicialPorc)}%)`} value={fmtMonto(Number(p.cuotaInicialMonto), moneda)} />
            <Row label="Monto financiado" value={fmtMonto(Number(p.montoFinanciado), moneda)} strong />
            <Row label={`Cuota final / Balloon (${Number(p.cuotaBalloonPorc)}%)`} value={fmtMonto(Number(p.cuotaBalloonMonto), moneda)} />
            <Row label="Plazo" value={`${p.plazoMeses} meses`} />
            <Row label="Tipo de tasa" value={`${p.tipoTasa} ${Number(p.valorTasa)}%${p.capitalizacion ? ` (cap. ${p.capitalizacion})` : ""}`} />
            <Row label="Tipo de gracia" value={`${p.tipoGracia}${p.mesesGracia ? ` (${p.mesesGracia} meses)` : ""}`} />
            <div className="my-2 border-t border-slate-100" />
            <Row label="Total intereses" value={fmtMonto(Number(r.totalIntereses), moneda)} />
            <Row label="Total seguros" value={fmtMonto(Number(r.totalSeguros), moneda)} />
            <Row label="Costo total del crédito" value={fmtMonto(Number(r.costoTotalCredito), moneda)} strong accent />
            <Row label="Monto total a pagar" value={fmtMonto(montoTotalPagar, moneda)} strong />
          </dl>
        </div>

        {/* Interpretación */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Interpretación financiera
          </h3>
          <ul className="space-y-4 text-sm">
            <Interp titulo="La TCEA refleja el costo efectivo anual del crédito.">
              Incluye intereses, seguros y comisiones. Compara siempre entre
              alternativas: a menor TCEA, menor costo real del financiamiento.
            </Interp>
            <Interp titulo="El VAN mide el valor presente de la operación.">
              Desde la perspectiva del deudor compara el monto financiado recibido
              con el valor presente de todos los pagos.
            </Interp>
            <Interp titulo="La TIR representa la rentabilidad implícita de los flujos.">
              Se calcula de forma mensual a partir de los pagos reales del crédito
              y se anualiza para obtener la TCEA.
            </Interp>
          </ul>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Importante: estos resultados son referenciales y pueden variar según las
            condiciones finales aprobadas por la entidad financiera.
          </p>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "brand" | "emerald" | "violet" | "amber";
}) {
  const bg = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  }[color];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg px-2 py-1 text-xs font-medium ${bg}`}>
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`${strong ? "font-semibold" : ""} ${accent ? "text-brand-600" : "text-slate-800"}`}>
        {value}
      </dd>
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
