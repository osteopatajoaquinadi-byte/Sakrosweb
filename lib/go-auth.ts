import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export type GoMiembro = { userId: string; email: string; rol: "coach" | "cliente"; atleta: string | null };

// Valida el token de Supabase que envía Sakros Go y devuelve su vínculo
// (coach o cliente). null si no hay sesión válida o no está vinculado.
export async function goMiembro(request: NextRequest): Promise<GoMiembro | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const db = getServiceClient();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: m } = await db
    .from("go_miembros")
    .select("email, rol, atleta")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!m) return null;
  return { userId: data.user.id, email: m.email, rol: m.rol, atleta: m.atleta };
}
