"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClienteForm() {
  const router = useRouter();
  const [f, setF] = useState({
    dni: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    direccion: "",
    estadoCivil: "",
    ocupacion: "",
    ingresosMensuales: "",
    historialCrediticio: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el cliente.");
        return;
      }
      router.push("/clientes");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Registro de Cliente</h1>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cliente"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-700">Datos personales</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="DNI *"><input required maxLength={8} value={f.dni} onChange={set("dni")} className={inp} placeholder="8 dígitos" /></F>
            <F label="Nombres *"><input required value={f.nombres} onChange={set("nombres")} className={inp} /></F>
            <F label="Apellidos *"><input required value={f.apellidos} onChange={set("apellidos")} className={inp} /></F>
            <F label="Teléfono"><input value={f.telefono} onChange={set("telefono")} className={inp} /></F>
            <F label="Correo"><input type="email" value={f.correo} onChange={set("correo")} className={inp} /></F>
            <F label="Estado civil">
              <select value={f.estadoCivil} onChange={set("estadoCivil")} className={inp}>
                <option value="">Seleccione</option>
                <option>Soltero(a)</option>
                <option>Casado(a)</option>
                <option>Divorciado(a)</option>
                <option>Viudo(a)</option>
              </select>
            </F>
            <F label="Dirección" span>
              <input value={f.direccion} onChange={set("direccion")} className={inp} />
            </F>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-700">Información económica y crediticia</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="Ocupación"><input value={f.ocupacion} onChange={set("ocupacion")} className={inp} /></F>
            <F label="Ingresos mensuales (S/)"><input type="number" step="0.01" value={f.ingresosMensuales} onChange={set("ingresosMensuales")} className={inp} /></F>
            <F label="Historial crediticio">
              <select value={f.historialCrediticio} onChange={set("historialCrediticio")} className={inp}>
                <option value="">Seleccione</option>
                <option>Normal</option>
                <option>Con problemas potenciales</option>
                <option>Deficiente</option>
                <option>Sin historial</option>
              </select>
            </F>
          </div>
        </section>
      </div>
    </form>
  );
}

const inp =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

function F({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-3" : ""}>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
