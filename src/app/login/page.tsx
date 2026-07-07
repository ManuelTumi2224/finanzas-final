import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/Logo";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/inicio");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel izquierdo (branding) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 p-10 lg:flex">
        <Logo variant="light" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Tu simulador inteligente para
            <br />
            <span className="text-brand-300">créditos vehiculares</span>
          </h1>
          <ul className="mt-8 space-y-4 text-slate-200">
            <li className="flex items-center gap-3">
              <Dot /> Simula tu crédito en segundos
            </li>
            <li className="flex items-center gap-3">
              <Dot /> Toma decisiones informadas
            </li>
            <li className="flex items-center gap-3">
              <Dot /> Resultados claros y confiables
            </li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-slate-400">
          © 2026 AutoFinanZ. Todos los derechos reservados.
        </p>
        <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      </div>

      {/* Panel derecho (formulario) */}
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo variant="dark" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenido a AutoFinanZ. Ingresa tus credenciales para continuar.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
      ✓
    </span>
  );
}
