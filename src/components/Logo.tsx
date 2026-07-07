// Logo de AutoFinanZ: icono de auto + wordmark "Auto" (blanco) + "FinanZ" (azul).

export function Logo({
  variant = "light",
  showTagline = true,
}: {
  variant?: "light" | "dark";
  showTagline?: boolean;
}) {
  const autoColor = variant === "light" ? "text-white" : "text-navy-900";
  return (
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 48 32"
        className="h-7 w-10 text-brand-500"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 22h40M8 22l4-9a4 4 0 0 1 3.7-2.5h16.6A4 4 0 0 1 36 13l4 9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="24" r="3.5" fill="currentColor" />
        <circle cx="34" cy="24" r="3.5" fill="currentColor" />
      </svg>
      <div className="leading-none">
        <div className="text-lg font-bold tracking-tight">
          <span className={autoColor}>Auto</span>
          <span className="text-brand-500">FinanZ</span>
        </div>
        {showTagline && (
          <div
            className={`mt-0.5 text-[10px] font-medium ${
              variant === "light" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Simula. Analiza. Decide.
          </div>
        )}
      </div>
    </div>
  );
}
