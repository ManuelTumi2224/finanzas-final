"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface Props {
  nombreCompleto: string;
  tipoUsuario: string;
  iniciales: string;
  children: React.ReactNode;
}

export function AppShell({ nombreCompleto, tipoUsuario, iniciales, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          {/* Botón hamburguesa (solo móvil/tablet) */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {iniciales}
            </span>
            <div className="hidden leading-tight sm:block">
              <div className="font-medium text-slate-800">{nombreCompleto}</div>
              <div className="text-xs capitalize text-slate-400">{tipoUsuario}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-slate-50 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
