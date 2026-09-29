import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyPin } from "@/lib/equipo-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const { id } = await params;

  const [patientRes, sessionsRes, paymentsRes, balanceRes] = await Promise.all([
    getSupabase().from("fichas_patients").select("*").eq("id", id).single(),
    getSupabase()
      .from("fichas_sessions")
      .select("*")
      .eq("patient_id", id)
      .order("session_date", { ascending: false }),
    getSupabase()
      .from("fichas_payments")
      .select("*")
      .eq("patient_id", id)
      .order("created_at", { ascending: false }),
    getSupabase()
      .from("fichas_patient_balance")
      .select("*")
      .eq("patient_id", id)
      .maybeSingle(),
  ]);

  if (patientRes.error || !patientRes.data) {
    return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    patient: patientRes.data,
    sessions: sessionsRes.data ?? [],
    payments: paymentsRes.data ?? [],
    balance: balanceRes.data,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();

  const { data, error } = await getSupabase()
    .from("fichas_patients")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al actualizar paciente." }, { status: 500 });
  }

  return NextResponse.json({ patient: data });
}
