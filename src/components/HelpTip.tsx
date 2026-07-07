// Tooltip de ayuda contextual [?] exigido por el enunciado (medio electronico de
// asistencia). Muestra una explicacion al pasar el cursor o enfocar el icono.
"use client";

import { useState } from "react";

export function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label="Ayuda"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-lg bg-navy-900 px-3 py-2 text-xs leading-snug text-slate-100 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
