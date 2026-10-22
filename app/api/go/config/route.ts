import { NextResponse } from "next/server";

// Sakros Go (public/go) es una página estática: pide aquí la URL y la clave
// pública de Supabase para iniciar sesión y leer sus datos con RLS.
export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }
  return NextResponse.json({ url, anonKey }, { headers: { "Cache-Control": "public, max-age=300" } });
}
