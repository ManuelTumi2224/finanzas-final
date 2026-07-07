"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";

const NAV = [
  { href: "/inicio", label: "Inicio", icon: "🏠" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/vehiculos", label: "Vehículos", icon: "🚗" },
  { href: "/simulaciones/nueva", label: "Configuración de crédito", icon: "📝" },
  { href: "/simulaciones", label: "Simulaciones", icon: "📊" },
  { href: "/ayuda", label: "Ayuda", icon: "❓" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-gradient-to-b from-navy-900 to-navy-950 text-slate-300">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo variant="light" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/simulaciones" &&
              item.href !== "/inicio" &&
              pathname.startsWith(item.href)) ||
            (item.href === "/simulaciones" &&
              pathname.startsWith("/simulaciones") &&
              !pathname.startsWith("/simulaciones/nueva"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-brand-600 font-medium text-white"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <span>↩</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
