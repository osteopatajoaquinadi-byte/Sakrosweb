import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyPin } from "@/lib/equipo-auth";

export async function POST(request: NextRequest) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const body = await request.json();
  const { patient_id, amount, method, payment_type, pack_name, sessions_purchased, service_type, reference, notes, registered_by } = body;

  if (!patient_id || !amount || !method || !payment_type || !registered_by) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("fichas_payments")
    .insert({
      patient_id,
      amount,
      method,
      payment_type,
      pack_name: pack_name || null,
      sessions_purchased: sessions_purchased || 1,
      service_type: service_type || null,
      reference: reference || null,
      notes: notes || null,
      registered_by,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al registrar pago." }, { status: 500 });
  }

  return NextResponse.json({ payment: data });
}
