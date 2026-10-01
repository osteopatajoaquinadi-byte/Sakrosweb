import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

export async function POST(request: NextRequest) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;

  const body = await request.json();
  const { patient_id, professional, service_type, session_date, eva_score, notes, clinical_data } = body;

  if (!patient_id || !professional || !service_type) {
    return NextResponse.json({ error: "Paciente, profesional y servicio son obligatorios." }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("fichas_sessions")
    .insert({
      patient_id,
      professional,
      service_type,
      session_date: session_date || new Date().toISOString(),
      eva_score: eva_score ?? null,
      notes: notes || null,
      clinical_data: clinical_data || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al registrar sesión." }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}
