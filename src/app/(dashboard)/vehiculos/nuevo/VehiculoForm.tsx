"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VehiculoForm() {
  const router = useRouter();
  const [f, setF] = useState({
    placa: "",
    marca: "",
    modelo: "",
    version: "",
    anio: "2024",
    color: "",
    kilometraje: "",
    numeroSerie: "",
    precioVenta: "",
    moneda: "PEN",
    tipoCombustible: "",
    transmision: "",
    estadoVehiculo: "Nuevo",
    concesionario: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el vehículo.");
        return;
      }
      router.push("/vehiculos");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Registro de Vehículo</h1>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar vehículo"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-700">Datos del vehículo</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="Placa"><input value={f.placa} onChange={set("placa")} className={inp} placeholder="Ej. ABC-123" /></F>
            <F label="Marca *"><input required value={f.marca} onChange={set("marca")} className={inp} /></F>
            <F label="Modelo *"><input required value={f.modelo} onChange={set("modelo")} className={inp} /></F>
            <F label="Versión"><input value={f.version} onChange={set("version")} className={inp} /></F>
            <F label="Año *"><input required type="number" value={f.anio} onChange={set("anio")} className={inp} /></F>
            <F label="Color"><input value={f.color} onChange={set("color")} className={inp} /></F>
            <F label="Kilometraje"><input type="number" value={f.kilometraje} onChange={set("kilometraje")} className={inp} /></F>
            <F label="N° de serie (VIN) *"><input required value={f.numeroSerie} onChange={set("numeroSerie")} className={inp} /></F>
            <F label="Estado">
              <select value={f.estadoVehiculo} onChange={set("estadoVehiculo")} className={inp}>
                <option>Nuevo</option>
                <option>Usado</option>
              </select>
            </F>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-700">Información comercial</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="Precio de venta *"><input required type="number" step="0.01" value={f.precioVenta} onChange={set("precioVenta")} className={inp} /></F>
            <F label="Moneda">
              <select value={f.moneda} onChange={set("moneda")} className={inp}>
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares (US$)</option>
              </select>
            </F>
            <F label="Concesionario"><input value={f.concesionario} onChange={set("concesionario")} className={inp} /></F>
            <F label="Tipo de combustible">
              <select value={f.tipoCombustible} onChange={set("tipoCombustible")} className={inp}>
                <option value="">Seleccione</option>
                <option>Gasolina</option>
                <option>Diésel</option>
                <option>GLP</option>
                <option>Híbrido</option>
                <option>Eléctrico</option>
              </select>
            </F>
            <F label="Transmisión">
              <select value={f.transmision} onChange={set("transmision")} className={inp}>
                <option value="">Seleccione</option>
                <option>Manual</option>
                <option>Automática</option>
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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
