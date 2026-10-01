import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { can, requireStaff } from "@/lib/equipo-auth";

// Campos visibles para quien no tiene acceso clínico (secretaría).
const CONTACT_FIELDS = "id, rut, name, phone, email, date_of_birth, address, created_at";
const CONTACT_KEYS = ["name", "rut", "phone", "email", "date_of_birth", "address"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, denied } = requireStaff(request, "pacientes");
  if (denied) return denied;

  const { id } = await params;
  const clinico = can(user, "clinico");
  const pagos = can(user, "pagos");
  const none = Promise.resolve({ data: [] as never[] });

  const [patientRes, sessionsRes, paymentsRes, balanceRes, balanceRowsRes] = await Promise.all([
    getSupabase()
      .from("fichas_patients")
      .select(clinico ? "*" : CONTACT_FIELDS)
      .eq("id", id)
      .single(),
    clinico
      ? getSupabase()
          .from("fichas_sessions")
          .select("*")
          .eq("patient_id", id)
          .order("session_date", { ascending: false })
      : none,
    pagos
      ? getSupabase()
          .from("fichas_payments")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false })
      : none,
    getSupabase()
      .from("fichas_patient_balance")
      .select("*")
      .eq("patient_id", id)
      .maybeSingle(),
    getSupabase()
      .from("fichas_session_balance")
      .select("payment_id, sessions_total, sessions_used, expires_at")
      .eq("patient_id", id),
  ]);

  if (patientRes.error || !patientRes.data) {
    return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    patient: patientRes.data,
    sessions: sessionsRes.data ?? [],
    payments: paymentsRes.data ?? [],
    balance: balanceRes.data,
    balance_rows: balanceRowsRes.data ?? [],
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, denied } = requireStaff(request, "pacientes");
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  // Sin acceso clínico solo se pueden editar los datos de contacto.
  const update = can(user, "clinico")
    ? body
    : Object.fromEntries(Object.entries(body).filter(([k]) => CONTACT_KEYS.includes(k)));
  delete update.id;
  delete update.created_by;
  delete update.created_at;

  const { data, error } = await getSupabase()
    .from("fichas_patients")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al actualizar paciente." }, { status: 500 });
  }

  return NextResponse.json({ patient: data });
}
