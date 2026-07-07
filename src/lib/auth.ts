// Utilidades de autorizacion para rutas y Server Components.
import { redirect } from "next/navigation";
import { getSession, type SessionData } from "./session";

/** Devuelve la sesion o redirige a /login si no hay sesion. */
export async function requireUser(): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
