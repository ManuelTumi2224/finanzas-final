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

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Backdrop (solo móvil cuando el menú está abierto) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-gradient-to-b from-navy-900 to-navy-950 text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Logo variant="light" />
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
                onClick={onClose}
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
    </>
  );
}
