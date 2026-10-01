import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { can, requireStaff } from "@/lib/equipo-auth";

export async function GET(request: NextRequest) {
  const { user, denied } = requireStaff(request, "pacientes");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  let query = getSupabase()
    .from("fichas_patients")
    .select(
      can(user, "clinico")
        ? "id, rut, name, phone, email, sport, reason, created_at"
        : "id, rut, name, phone, email, created_at"
    )
    .order("name");

  if (q) {
    query = query.or(`name.ilike.%${q}%,rut.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: "Error al cargar pacientes." }, { status: 500 });
  }

  return NextResponse.json({ patients: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, denied } = requireStaff(request, "pacientes");
  if (denied) return denied;

  const body = await request.json();
  const { name, rut, phone, email, date_of_birth } = body;
  // Los datos clínicos solo los puede cargar quien tiene acceso clínico.
  const clinical = can(user, "clinico") ? body : {};
  const { occupation, sport, reason, red_flags, yellow_flags, notes } = clinical;
  const created_by = user.username;

  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("fichas_patients")
    .insert({
      name,
      rut: rut || null,
      phone: phone || null,
      email: email || null,
      date_of_birth: date_of_birth || null,
      occupation: occupation || null,
      sport: sport || null,
      reason: reason || null,
      red_flags: red_flags || null,
      yellow_flags: yellow_flags || null,
      notes: notes || null,
      created_by,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al crear paciente." }, { status: 500 });
  }

  return NextResponse.json({ patient: data });
}
