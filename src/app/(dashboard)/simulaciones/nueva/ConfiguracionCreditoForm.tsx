"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HelpTip } from "@/components/HelpTip";
import { ayuda } from "@/lib/glosario";
import { simular } from "@/lib/finance/simulate";
import { validarEntrada } from "@/lib/finance/validate";
import { fmtMonto, fmtPct } from "@/lib/format";
import type {
  Capitalizacion,
  EntradaSimulacion,
  Moneda,
  TipoGracia,
  TipoTasa,
} from "@/lib/finance/types";

interface ClienteOpt {
  idCliente: number;
  nombres: string;
  apellidos: string;
  dni: string;
}
interface VehiculoOpt {
  idVehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  precioVenta: number;
  moneda: string | null;
}
interface EntidadOpt {
  idEntidad: number;
  nombreEntidad: string;
}

export function ConfiguracionCreditoForm({
  clientes,
  vehiculos,
  entidades,
}: {
  clientes: ClienteOpt[];
  vehiculos: VehiculoOpt[];
  entidades: EntidadOpt[];
}) {
  const router = useRouter();
  const [idCliente, setIdCliente] = useState<number | "">("");
  const [idVehiculo, setIdVehiculo] = useState<number | "">("");
  const [idEntidad, setIdEntidad] = useState<number | "">("");

  const [moneda, setMoneda] = useState<Moneda>("PEN");
  const [precioVehiculo, setPrecioVehiculo] = useState(80000);
  const [cuotaInicialPct, setCuotaInicialPct] = useState(20);
  const [balloonPct, setBalloonPct] = useState(30);
  const [plazoMeses, setPlazoMeses] = useState(36);
  const [tipoTasa, setTipoTasa] = useState<TipoTasa>("TEA");
  const [valorTasa, setValorTasa] = useState(14.5);
  const [capitalizacion, setCapitalizacion] =
    useState<Capitalizacion>("mensual");
  const [tipoGracia, setTipoGracia] = useState<TipoGracia>("ninguna");
  const [mesesGracia, setMesesGracia] = useState(0);
  const [seguroDesgravamenPct, setSeguroDesgravamenPct] = useState(0.05);
  const [seguroVehicular, setSeguroVehicular] = useState(150);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const entrada: EntradaSimulacion = {
    moneda,
    precioVehiculo,
    cuotaInicialPct,
    balloonPct,
    plazoMeses,
    tipoTasa,
    valorTasa,
    capitalizacion: tipoTasa === "TNA" ? capitalizacion : undefined,
    tipoGracia,
    mesesGracia: tipoGracia === "ninguna" ? 0 : mesesGracia,
    seguroDesgravamenPct,
    seguroVehicular,
  };

  const errores = useMemo(() => validarEntrada(entrada), [entrada]);
  const valido = Object.keys(errores).length === 0;

  const preview = useMemo(() => {
    if (!valido) return null;
    try {
      return simular(entrada);
    } catch {
      return null;
    }
  }, [entrada, valido]);

  function seleccionarVehiculo(id: number | "") {
    setIdVehiculo(id);
    const v = vehiculos.find((x) => x.idVehiculo === id);
    if (v) {
      setPrecioVehiculo(v.precioVenta);
      if (v.moneda === "USD" || v.moneda === "PEN") setMoneda(v.moneda);
    }
  }

  async function guardar() {
    setErrorMsg("");
    if (!idCliente || !idVehiculo || !idEntidad) {
      setErrorMsg("Selecciona cliente, vehículo y entidad financiera.");
      return;
    }
    if (!valido) {
      setErrorMsg("Corrige los datos marcados en rojo antes de continuar.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/simulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCliente, idVehiculo, idEntidad, ...entrada }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "No se pudo guardar la simulación.");
        return;
      }
      router.push(`/simulaciones/${data.idSimulacion}`);
    } catch {
      setErrorMsg("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configuración del Crédito
          </h1>
          <p className="text-sm text-slate-500">
            Simulaciones › Nueva simulación
          </p>
        </div>
        <button
          onClick={guardar}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Calculando…" : "Calcular plan de pagos →"}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Formulario */}
        <div className="space-y-5">
          <Card title="Información base">
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Cliente"
                value={idCliente}
                onChange={(v) => setIdCliente(v ? Number(v) : "")}
                options={clientes.map((c) => ({
                  value: c.idCliente,
                  label: `${c.nombres} ${c.apellidos}`,
                }))}
                placeholder="Selecciona cliente"
              />
              <Select
                label="Vehículo"
                value={idVehiculo}
                onChange={(v) => seleccionarVehiculo(v ? Number(v) : "")}
                options={vehiculos.map((v) => ({
                  value: v.idVehiculo,
                  label: `${v.marca} ${v.modelo} ${v.anio}`,
                }))}
                placeholder="Selecciona vehículo"
              />
              <Select
                label="Entidad financiera"
                value={idEntidad}
                onChange={(v) => setIdEntidad(v ? Number(v) : "")}
                options={entidades.map((e) => ({
                  value: e.idEntidad,
                  label: e.nombreEntidad,
                }))}
                placeholder="Selecciona entidad"
              />
            </div>
          </Card>

          <Card title="1. Monto y aportes">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Moneda"
                value={moneda}
                onChange={(v) => setMoneda(v as Moneda)}
                options={[
                  { value: "PEN", label: "Soles (S/)" },
                  { value: "USD", label: "Dólares (US$)" },
                ]}
              />
              <Num
                label="Precio del vehículo"
                help={ayuda("precioVehiculo")}
                value={precioVehiculo}
                onChange={setPrecioVehiculo}
                error={errores.precioVehiculo}
              />
              <Num
                label="Cuota inicial (%)"
                help={ayuda("cuotaInicial")}
                value={cuotaInicialPct}
                onChange={setCuotaInicialPct}
                step={0.01}
                error={errores.cuotaInicialPct}
              />
              <Num
                label="Cuota final / Balloon (%)"
                help={ayuda("balloon")}
                value={balloonPct}
                onChange={setBalloonPct}
                step={0.01}
                error={errores.balloonPct}
              />
            </div>
          </Card>

          <Card title="2. Plazo y tasas">
            <div className="grid gap-4 sm:grid-cols-2">
              <Num
                label="Plazo del crédito (meses)"
                help={ayuda("plazo")}
                value={plazoMeses}
                onChange={(v) => setPlazoMeses(Math.round(v))}
                step={1}
                error={errores.plazoMeses}
              />
              <Select
                label="Tipo de tasa"
                help={ayuda("tipoTasa")}
                value={tipoTasa}
                onChange={(v) => setTipoTasa(v as TipoTasa)}
                options={[
                  { value: "TEA", label: "TEA (Efectiva Anual)" },
                  { value: "TNA", label: "TNA (Nominal Anual)" },
                ]}
              />
              <Num
                label="Valor de la tasa (%)"
                value={valorTasa}
                onChange={setValorTasa}
                step={0.0001}
                error={errores.valorTasa}
              />
              <Select
                label="Capitalización"
                help={ayuda("capitalizacion")}
                value={capitalizacion}
                onChange={(v) => setCapitalizacion(v as Capitalizacion)}
                disabled={tipoTasa !== "TNA"}
                options={[
                  { value: "diaria", label: "Diaria" },
                  { value: "quincenal", label: "Quincenal" },
                  { value: "mensual", label: "Mensual" },
                  { value: "bimestral", label: "Bimestral" },
                  { value: "trimestral", label: "Trimestral" },
                  { value: "semestral", label: "Semestral" },
                  { value: "anual", label: "Anual" },
                ]}
                error={errores.capitalizacion}
              />
            </div>
          </Card>

          <Card title="3. Periodo de gracia">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo de gracia"
                help={ayuda("gracia")}
                value={tipoGracia}
                onChange={(v) => setTipoGracia(v as TipoGracia)}
                options={[
                  { value: "ninguna", label: "Ninguna" },
                  { value: "parcial", label: "Parcial (paga interés)" },
                  { value: "total", label: "Total (no paga)" },
                ]}
              />
              <Num
                label="Meses de gracia"
                value={mesesGracia}
                onChange={(v) => setMesesGracia(Math.round(v))}
                step={1}
                disabled={tipoGracia === "ninguna"}
                error={errores.mesesGracia}
              />
            </div>
          </Card>

          <Card title="4. Seguros y comisiones">
            <div className="grid gap-4 sm:grid-cols-2">
              <Num
                label="Seguro de desgravamen (% mensual)"
                help={ayuda("seguroDesgravamen")}
                value={seguroDesgravamenPct}
                onChange={setSeguroDesgravamenPct}
                step={0.0001}
                error={errores.seguroDesgravamenPct}
              />
              <Num
                label="Seguro vehicular (monto mensual)"
                help={ayuda("seguroVehicular")}
                value={seguroVehicular}
                onChange={setSeguroVehicular}
                error={errores.seguroVehicular}
              />
            </div>
          </Card>
        </div>

        {/* Resumen en vivo */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Resumen del crédito
            </h3>
            {preview ? (
              <dl className="space-y-2 text-sm">
                <Row label="Precio del vehículo" value={fmtMonto(precioVehiculo, moneda)} />
                <Row
                  label={`(-) Cuota inicial (${cuotaInicialPct}%)`}
                  value={fmtMonto(preview.cuotaInicial, moneda)}
                />
                <Row
                  label={`(-) Cuota final (${balloonPct}%)`}
                  value={fmtMonto(preview.montoBalloon, moneda)}
                />
                <div className="my-2 border-t border-slate-100" />
                <Row
                  label="Monto a financiar"
                  value={fmtMonto(preview.montoFinanciado, moneda)}
                  strong
                />
                <Row
                  label="Cuota mensual (aprox.)"
                  value={fmtMonto(preview.cuotaBase, moneda)}
                  strong
                  accent
                />
                <div className="my-2 border-t border-slate-100" />
                <Row label="TEA" value={fmtPct(preview.tea, 4)} />
                <Row label="TEM" value={fmtPct(preview.tem, 4)} />
                <Row
                  label="TCEA (aprox.)"
                  value={Number.isFinite(preview.tcea) ? fmtPct(preview.tcea, 4) : "—"}
                  accent
                />
                <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                  Los resultados (cuota, TCEA, VAN, TIR) se guardarán al generar el
                  plan de pagos.
                </p>
              </dl>
            ) : (
              <p className="text-sm text-slate-400">
                Completa los datos para ver el resumen. Corrige los campos en rojo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Componentes de apoyo ---- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-brand-700">{title}</h3>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`${strong ? "font-semibold" : ""} ${
          accent ? "text-brand-600" : "text-slate-800"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  step = 0.01,
  help,
  disabled,
  error,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  help?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center text-xs font-medium text-slate-600">
        {label}
        {help && <HelpTip text={help} />}
      </label>
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100 disabled:text-slate-400 ${
          error ? "border-red-400" : "border-slate-300 focus:border-brand-500"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  help,
  disabled,
  error,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  help?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center text-xs font-medium text-slate-600">
        {label}
        {help && <HelpTip text={help} />}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100 disabled:text-slate-400 ${
          error ? "border-red-400" : "border-slate-300 focus:border-brand-500"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
