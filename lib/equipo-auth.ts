import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// Sesión del panel del equipo: cookie httpOnly firmada con HMAC. El PIN se
// verifica una sola vez en /api/equipo/login (contra el hash en la BD) y
// después cada request se autoriza por rol con requireStaff().

export type StaffRole = "admin" | "profesional" | "secretaria";

export type StaffUser = {
  username: string;
  display_name: string;
  role: StaffRole;
  professional_slug: string | null;
};

export type Permission =
  | "calendario" // ver la agenda
  | "agendar" // crear y cancelar reservas desde el panel
  | "pacientes" // lista y datos de contacto de pacientes
  | "clinico" // fichas clínicas: sesiones, motivo, banderas, notas
  | "pagos"; // registrar, editar y eliminar pagos

const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  admin: ["calendario", "agendar", "pacientes", "clinico", "pagos"],
  profesional: ["calendario", "agendar", "pacientes", "clinico", "pagos"],
  secretaria: ["calendario", "agendar", "pacientes", "pagos"],
};

export function can(user: StaffUser, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function permissionsFor(role: StaffRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const SESSION_COOKIE = "sakros_equipo";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 horas

function secret(): string {
  if (process.env.STAFF_SESSION_SECRET) return process.env.STAFF_SESSION_SECRET;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY o STAFF_SESSION_SECRET.");
  // Derivada de la clave de servicio (secreta, solo servidor) para no
  // exigir otra variable de entorno.
  return createHash("sha256").update(`sakros-equipo-session:${key}`).digest("hex");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: StaffUser): string {
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(request: NextRequest): StaffUser | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return {
      username: data.username,
      display_name: data.display_name,
      role: data.role,
      professional_slug: data.professional_slug ?? null,
    };
  } catch {
    return null;
  }
}

// Devuelve el usuario si tiene el permiso, o una respuesta 401/403.
export function requireStaff(
  request: NextRequest,
  permission: Permission
): { user: StaffUser; denied?: never } | { user?: never; denied: NextResponse } {
  const user = readSession(request);
  if (!user) {
    return { denied: NextResponse.json({ error: "Sesión expirada. Vuelve a ingresar." }, { status: 401 }) };
  }
  if (!can(user, permission)) {
    return { denied: NextResponse.json({ error: "No tienes permiso para esta acción." }, { status: 403 }) };
  }
  return { user };
}
