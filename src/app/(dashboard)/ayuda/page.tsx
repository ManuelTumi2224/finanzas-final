import { requireUser } from "@/lib/auth";
import { GLOSARIO } from "@/lib/glosario";

const GUIAS = [
  { t: "¿Cómo crear un cliente?", d: "Ve a Clientes › Nuevo cliente, completa los datos personales y económicos y guarda." },
  { t: "¿Cómo registrar un vehículo?", d: "Ve a Vehículos › Nuevo vehículo e ingresa marca, modelo, año y precio de venta." },
  { t: "¿Cómo configurar un crédito?", d: "En Configuración de crédito elige cliente, vehículo y entidad, y define tasa, plazo, gracia y seguros." },
  { t: "¿Cómo interpretar el plan de pagos?", d: "Cada fila muestra el saldo, interés, amortización y cuota del mes. La última incluye el balloon." },
  { t: "¿Cómo analizar los resultados?", d: "Compara la TCEA entre alternativas; a menor TCEA, menor costo real del crédito." },
];

export default async function AyudaPage() {
  await requireUser();
  const conceptos = Object.values(GLOSARIO);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Ayuda y Asistencia al Usuario
      </h1>
      <p className="text-sm text-slate-500">
        Encuentra respuestas y aprende a usar AutoFinanZ.
      </p>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Conceptos financieros
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {conceptos.map((c) => (
          <div
            key={c.clave}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="font-semibold text-slate-800">{c.titulo}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.texto}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Guías rápidas
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIAS.map((g) => (
          <div key={g.t} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-brand-700">{g.t}</h3>
            <p className="mt-1 text-sm text-slate-500">{g.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
