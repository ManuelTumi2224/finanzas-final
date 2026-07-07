// Glosario de conceptos financieros. Se usa en los tooltips [?] de los formularios
// y en la pantalla de Ayuda (seccion 6.2.7 del informe).

export interface ConceptoAyuda {
  clave: string;
  titulo: string;
  texto: string;
}

export const GLOSARIO: Record<string, ConceptoAyuda> = {
  precioVehiculo: {
    clave: "precioVehiculo",
    titulo: "Precio del vehículo",
    texto:
      "Valor total del vehículo que se desea adquirir. Sobre este monto se calculan la cuota inicial y la cuota final (balloon).",
  },
  cuotaInicial: {
    clave: "cuotaInicial",
    titulo: "Cuota inicial",
    texto:
      "Pago que realiza el cliente al inicio de la operación. Reduce el monto a financiar. Debe estar entre 10% y 50% del precio.",
  },
  montoFinanciado: {
    clave: "montoFinanciado",
    titulo: "Monto financiado",
    texto:
      "Es el capital que la entidad financiera presta: precio del vehículo menos la cuota inicial.",
  },
  balloon: {
    clave: "balloon",
    titulo: "Cuota final o Balloon",
    texto:
      "Parte del valor del vehículo que se deja para el final del contrato (Compra Inteligente). Permite cuotas mensuales más bajas. Debe estar entre 10% y 40%.",
  },
  plazo: {
    clave: "plazo",
    titulo: "Plazo del crédito",
    texto: "Tiempo total del crédito en meses. Debe estar entre 12 y 60 meses.",
  },
  tipoTasa: {
    clave: "tipoTasa",
    titulo: "TNA y TEA",
    texto:
      "TEA es la Tasa Efectiva Anual (ya incluye la capitalización). TNA es la Tasa Nominal Anual y requiere una frecuencia de capitalización para convertirla a efectiva.",
  },
  capitalizacion: {
    clave: "capitalizacion",
    titulo: "Capitalización",
    texto:
      "Frecuencia con la que la TNA capitaliza intereses (diaria, mensual, etc.). Solo aplica cuando el tipo de tasa es TNA.",
  },
  gracia: {
    clave: "gracia",
    titulo: "Periodos de gracia",
    texto:
      "Tiempo inicial en el que el cliente no paga amortización. En gracia parcial paga solo intereses; en gracia total no paga y el interés se suma al saldo. Máximo 6 meses.",
  },
  seguroDesgravamen: {
    clave: "seguroDesgravamen",
    titulo: "Seguro de desgravamen",
    texto:
      "Seguro mensual calculado como un porcentaje sobre el saldo deudor. Cubre la deuda en caso de fallecimiento del titular.",
  },
  seguroVehicular: {
    clave: "seguroVehicular",
    titulo: "Seguro vehicular",
    texto: "Costo fijo mensual del seguro del automóvil.",
  },
  van: {
    clave: "van",
    titulo: "VAN (Valor Actual Neto)",
    texto:
      "Mide el valor presente de los flujos del crédito descontados a una tasa. Desde la vista del deudor compara el monto financiado recibido con el valor presente de los pagos.",
  },
  tir: {
    clave: "tir",
    titulo: "TIR (Tasa Interna de Retorno)",
    texto:
      "Tasa que iguala a cero el valor presente de los flujos del crédito. Aquí se calcula de forma mensual a partir de los pagos reales.",
  },
  tcea: {
    clave: "tcea",
    titulo: "TCEA (Tasa de Costo Efectivo Anual)",
    texto:
      "Refleja el costo real anual del crédito incluyendo intereses, seguros y comisiones. Es el mejor indicador para comparar alternativas: a menor TCEA, menor costo.",
  },
};

export function ayuda(clave: keyof typeof GLOSARIO): string {
  return GLOSARIO[clave]?.texto ?? "";
}
