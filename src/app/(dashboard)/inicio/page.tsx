import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function InicioPage() {
  const session = await requireUser();
  const [nClientes, nVehiculos, nSims, nEntidades] = await Promise.all([
    prisma.cliente.count(),
    prisma.vehiculo.count(),
    prisma.simulacion.count(),
    prisma.entidadFinanciera.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Hola, {session.nombreCompleto.split(" ")[0]} 👋
      </h1>
      <p className="text-sm text-slate-500">
        Bienvenido a AutoFinanZ. Este es el resumen de tu actividad.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clientes" value={nClientes} icon="👥" href="/clientes" />
        <Stat label="Vehículos" value={nVehiculos} icon="🚗" href="/vehiculos" />
        <Stat label="Simulaciones" value={nSims} icon="📊" href="/simulaciones" />
        <Stat label="Entidades" value={nEntidades} icon="🏦" href="/simulaciones/nueva" />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-gradient-to-br from-navy-900 to-brand-800 p-8 text-white">
        <h2 className="text-xl font-semibold">
          ¿Listo para simular un crédito vehicular?
        </h2>
        <p className="mt-1 max-w-lg text-sm text-slate-200">
          Configura las condiciones del crédito bajo la modalidad Compra Inteligente
          y obtén el cronograma de pagos, la TCEA, el VAN y la TIR al instante.
        </p>
        <Link
          href="/simulaciones/nueva"
          className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-slate-100"
        >
          + Nueva simulación
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
    </Link>
  );
}
