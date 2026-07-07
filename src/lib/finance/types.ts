// Tipos del motor financiero de AutoFinanZ
// Basado en el informe TF_Finanzas (secciones 6.1, 6.3, 7).

export type Moneda = "PEN" | "USD";
export type TipoTasa = "TEA" | "TNA";
export type TipoGracia = "ninguna" | "parcial" | "total";

/** Frecuencia de capitalizacion para TNA -> numero de capitalizaciones por anio (m). */
export type Capitalizacion =
  | "diaria"
  | "quincenal"
  | "mensual"
  | "bimestral"
  | "trimestral"
  | "cuatrimestral"
  | "semestral"
  | "anual";

export const CAPITALIZACIONES_POR_ANIO: Record<Capitalizacion, number> = {
  diaria: 360,
  quincenal: 24,
  mensual: 12,
  bimestral: 6,
  trimestral: 4,
  cuatrimestral: 3,
  semestral: 2,
  anual: 1,
};

/** Datos de entrada del simulador (seccion 6.1.1 del informe). */
export interface EntradaSimulacion {
  moneda: Moneda;
  /** Precio del vehiculo (PV). > 0 */
  precioVehiculo: number;
  /** % de cuota inicial. 10 <= x <= 50 */
  cuotaInicialPct: number;
  /** % de cuota final / balloon. 10 <= x <= 40 */
  balloonPct: number;
  /** Plazo total en meses (N). 12 <= x <= 60 */
  plazoMeses: number;
  tipoTasa: TipoTasa;
  /** Valor de la tasa en % (TEA o TNA). > 0 */
  valorTasa: number;
  /** Solo aplica si tipoTasa = TNA. */
  capitalizacion?: Capitalizacion;
  tipoGracia: TipoGracia;
  /** Meses de gracia al inicio. 0 <= x <= 6 y < plazoMeses */
  mesesGracia: number;
  /** Tasa mensual del seguro de desgravamen sobre el saldo, en % (ej. 0.05). >= 0 */
  seguroDesgravamenPct: number;
  /** Costo fijo mensual del seguro vehicular, en monto. >= 0 */
  seguroVehicular: number;
  /**
   * Tasa de descuento mensual para el VAN, en % (opcional).
   * Si no se indica, se usa la TEM (costo efectivo mensual del credito).
   */
  tasaDescuentoVANPct?: number;
}

/** Una fila del cronograma de pagos (seccion 6.2.5). */
export interface FilaCronograma {
  mes: number;
  saldoInicial: number;
  interes: number;
  amortizacion: number;
  seguroDesgravamen: number;
  seguroVehicular: number;
  /** Cuota total del mes = cuota base (o interes en gracia) + seguros (+ balloon en el ultimo mes). */
  cuotaTotal: number;
  saldoFinal: number;
  esGracia: boolean;
  tipoGraciaAplicada: TipoGracia | null;
}

/** Resultado completo de la simulacion (datos de salida, seccion 6.1.2). */
export interface ResultadoSimulacion {
  cuotaInicial: number;
  montoFinanciado: number;
  montoBalloon: number;
  tea: number; // decimal (0.145 = 14.5%)
  tem: number; // decimal
  /** Cuota base constante del tramo de amortizacion (sin seguros). */
  cuotaBase: number;
  cronograma: FilaCronograma[];
  totalIntereses: number;
  totalSeguros: number;
  costoTotalCredito: number;
  van: number;
  tirMensual: number; // decimal
  tcea: number; // decimal
}
