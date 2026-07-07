// Manejo de sesion con JWT firmado en cookie httpOnly (jose).
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "autofinanz_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-change-me-please-32chars-min",
);

export interface SessionData {
  idUsuario: number;
  nombreUsuario: string;
  nombreCompleto: string;
  tipoUsuario: string;
}

/** Crea la cookie de sesion firmada (valida 8 horas). */
export async function createSession(data: SessionData): Promise<void> {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

/** Devuelve los datos de la sesion actual o null si no hay sesion valida. */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      idUsuario: payload.idUsuario as number,
      nombreUsuario: payload.nombreUsuario as string,
      nombreCompleto: payload.nombreCompleto as string,
      tipoUsuario: payload.tipoUsuario as string,
    };
  } catch {
    return null;
  }
}

/** Elimina la cookie de sesion. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
