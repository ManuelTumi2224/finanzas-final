import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  const iniciales = session.nombreCompleto
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <AppShell
      nombreCompleto={session.nombreCompleto}
      tipoUsuario={session.tipoUsuario}
      iniciales={iniciales}
    >
      {children}
    </AppShell>
  );
}
