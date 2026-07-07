import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ConfiguracionCreditoForm } from "./ConfiguracionCreditoForm";

export default async function NuevaSimulacionPage() {
  await requireUser();

  const [clientes, vehiculos, entidades] = await Promise.all([
    prisma.cliente.findMany({
      select: { idCliente: true, nombres: true, apellidos: true, dni: true },
      orderBy: { apellidos: "asc" },
    }),
    prisma.vehiculo.findMany({
      where: { estadoDisponibilidad: true },
      select: {
        idVehiculo: true,
        marca: true,
        modelo: true,
        anio: true,
        precioVenta: true,
        moneda: true,
      },
      orderBy: { marca: "asc" },
    }),
    prisma.entidadFinanciera.findMany({
      where: { activa: true },
      select: { idEntidad: true, nombreEntidad: true },
      orderBy: { nombreEntidad: "asc" },
    }),
  ]);

  return (
    <ConfiguracionCreditoForm
      clientes={clientes}
      vehiculos={vehiculos.map((v) => ({
        ...v,
        precioVenta: Number(v.precioVenta),
      }))}
      entidades={entidades}
    />
  );
}
