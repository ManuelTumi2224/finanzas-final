# AutoFinanZ

Simulador de créditos vehiculares bajo la modalidad **Compra Inteligente** (método
francés vencido con cuota final / balloon), desarrollado para el curso de Finanzas e
Ingeniería Económica (UPC). Implementa el análisis y diseño del informe: login,
base de datos, cronograma de pagos, periodos de gracia e indicadores VAN, TIR y TCEA.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Prisma 6** + **MySQL** (desplegable en Railway)
- **bcryptjs** (hash de contraseñas) + **jose** (sesión JWT en cookie httpOnly)
- **Vitest** (validación del motor financiero)

## Estructura

```
src/
  lib/finance/      Motor financiero puro (tasas, cronograma, VAN/TIR/TCEA) + tests
  lib/              prisma, session, auth, audit, password, format, glosario
  app/login/        Pantalla de inicio de sesión
  app/(dashboard)/  Inicio, clientes, vehículos, simulaciones, resultados, ayuda
  app/api/          Rutas de login/logout, clientes, vehículos, simulaciones
prisma/
  schema.prisma     Modelo de datos (10 tablas del Anexo 1)
  schema.sql        Script SQL generado (referencia para el informe)
  seed.ts           Datos iniciales (usuarios, entidades, clientes, vehículos)
```

## Puesta en marcha

### 1. Base de datos (MySQL en Railway)

1. Crea un proyecto en [Railway](https://railway.app) y añade un servicio **MySQL**.
2. Copia la URL de conexión pública (`mysql://root:...@...proxy.rlwy.net:PUERTO/railway`).
3. Colócala en `.env`:

```env
DATABASE_URL="mysql://root:PASSWORD@HOST:PUERTO/railway"
SESSION_SECRET="un-secreto-largo-aleatorio-de-32-caracteres-o-mas"
```

### 2. Instalar y preparar

```bash
npm install
npm run prisma:generate       # genera el cliente Prisma
npx prisma db push            # crea las tablas en MySQL
npm run db:seed               # carga usuarios y datos de ejemplo
```

### 3. Ejecutar

```bash
npm run dev                   # http://localhost:3000
```

**Usuario de prueba:** `asesor` / `asesor123` (también `admin` / `admin123`).

## Validación y pruebas

El motor financiero se valida contra los resultados esperados de la sección 6.4.3
del informe (4 casos: TEA/TNA, soles/dólares, con y sin gracia):

```bash
npm test
```

> Nota: el manejo del periodo de gracia recalcula la cuota francesa sobre los meses
> restantes tras la gracia (ver comentario en `src/lib/finance/simulate.ts`), que es
> la única forma que reproduce los valores esperados del informe.

## Despliegue en Railway

1. Conecta el repositorio a Railway (servicio web) junto al servicio MySQL.
2. Variables de entorno del servicio web: `DATABASE_URL` (referencia a la del MySQL)
   y `SESSION_SECRET`.
3. Build: `npm run build` · Start: `npm run start`. Ejecuta `npx prisma db push` y
   `npm run db:seed` una vez contra la base de datos de producción.
