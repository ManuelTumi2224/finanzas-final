// Datos iniciales para AutoFinanZ. Ejecutar con: npm run db:seed
import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Usuarios (contrasenas cifradas con bcrypt) ---
  const asesorHash = await bcrypt.hash("asesor123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { nombreUsuario: "asesor" },
    update: {},
    create: {
      nombreUsuario: "asesor",
      passwordHash: asesorHash,
      correo: "asesor@autofinanz.pe",
      nombreCompleto: "Asesor Comercial",
      tipoUsuario: "asesor",
    },
  });
  await prisma.usuario.upsert({
    where: { nombreUsuario: "admin" },
    update: {},
    create: {
      nombreUsuario: "admin",
      passwordHash: adminHash,
      correo: "admin@autofinanz.pe",
      nombreCompleto: "Administrador del Sistema",
      tipoUsuario: "administrador",
    },
  });

  // --- Entidades financieras (autorizadas por la SBS) ---
  const entidades = [
    { codigoEntidad: "BCP", nombreEntidad: "Banco de Crédito del Perú", tipoEntidad: "Banco", teaMinima: 12, teaMaxima: 22 },
    { codigoEntidad: "BBVA", nombreEntidad: "BBVA Perú", tipoEntidad: "Banco", teaMinima: 11.5, teaMaxima: 21 },
    { codigoEntidad: "IBK", nombreEntidad: "Interbank", tipoEntidad: "Banco", teaMinima: 12.5, teaMaxima: 23 },
    { codigoEntidad: "SCP", nombreEntidad: "Santander Consumer Perú", tipoEntidad: "Financiera", teaMinima: 13, teaMaxima: 24 },
  ];
  for (const e of entidades) {
    await prisma.entidadFinanciera.upsert({
      where: { codigoEntidad: e.codigoEntidad },
      update: {},
      create: e,
    });
  }

  // --- Clientes de ejemplo ---
  const clientes = [
    { dni: "70123456", nombres: "María Fernanda", apellidos: "López Ríos", telefono: "987654321", correo: "mflopez@example.com", ingresosMensuales: 6500, ocupacion: "Ingeniera", estadoCivil: "Soltero(a)", historialCrediticio: "Normal" },
    { dni: "40567891", nombres: "Carlos Alberto", apellidos: "Ramírez Soto", telefono: "912345678", correo: "cramirez@example.com", ingresosMensuales: 9200, ocupacion: "Médico", estadoCivil: "Casado(a)", historialCrediticio: "Normal" },
  ];
  for (const c of clientes) {
    await prisma.cliente.upsert({
      where: { dni: c.dni },
      update: {},
      create: c,
    });
  }

  // --- Vehiculos de ejemplo ---
  const vehiculos = [
    { marca: "Toyota", modelo: "Corolla Cross", anio: 2024, version: "XLI", precioVenta: 95000, moneda: "PEN", numeroSerie: "VIN-TOY-0001", estadoVehiculo: "Nuevo", concesionario: "Toyota Perú", tipoCombustible: "Gasolina", transmision: "Automática" },
    { marca: "Hyundai", modelo: "Tucson", anio: 2024, version: "GLS", precioVenta: 28000, moneda: "USD", numeroSerie: "VIN-HYU-0002", estadoVehiculo: "Nuevo", concesionario: "Hyundai Perú", tipoCombustible: "Diésel", transmision: "Automática" },
    { marca: "Kia", modelo: "Sportage", anio: 2023, version: "LX", precioVenta: 80000, moneda: "PEN", numeroSerie: "VIN-KIA-0003", estadoVehiculo: "Usado", concesionario: "Kia Motors", tipoCombustible: "Gasolina", transmision: "Manual" },
  ];
  for (const v of vehiculos) {
    await prisma.vehiculo.upsert({
      where: { numeroSerie: v.numeroSerie },
      update: {},
      create: v,
    });
  }

  console.log("Seed completado: usuarios, entidades, clientes y vehículos.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
