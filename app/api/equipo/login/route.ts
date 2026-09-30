import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  permissionsFor,
  type StaffUser,
} from "@/lib/equipo-auth";

export async function POST(request: NextRequest) {
  const { username, pin } = await request.json().catch(() => ({}));
  if (!username || !pin) {
    return NextResponse.json({ error: "Ingresa tu usuario y PIN." }, { status: 400 });
  }

  const { data, error } = await getServiceClient().rpc("staff_login", {
    p_username: String(username),
    p_pin: String(pin),
  });

  if (error) {
    return NextResponse.json({ error: "Error al verificar el acceso." }, { status: 500 });
  }
  if (data?.locked) {
    return NextResponse.json(
      { error: "Demasiados intentos fallidos. Espera 15 minutos." },
      { status: 429 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Usuario o PIN incorrecto." }, { status: 401 });
  }

  const user = data as StaffUser;
  const res = NextResponse.json({ user, permissions: permissionsFor(user.role) });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
