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

const EDITABLE_FIELDS = [
  "amount",
  "method",
  "payment_type",
  "pack_name",
  "sessions_purchased",
  "service_type",
  "reference",
  "notes",
] as const;

// Editar un pago. Mantiene sincronizado el saldo de sesiones que generó
// (fichas_session_balance) y permite corregir cuántas sesiones se han usado.
export async function PATCH(request: NextRequest) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const body = await request.json();
  const { id, sessions_used } = body;
  if (!id) {
    return NextResponse.json({ error: "Falta el id del pago." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field] === "" ? null : body[field];
  }
  if ("sessions_purchased" in update) {
    const n = Number(update.sessions_purchased);
    if (!Number.isInteger(n) || n < 0) {
      return NextResponse.json({ error: "Sesiones compradas inválidas." }, { status: 400 });
    }
  }

  const supabase = getSupabase();
  let payment = null;
  if (Object.keys(update).length > 0) {
    const { data, error } = await supabase
      .from("fichas_payments")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Error al actualizar pago." }, { status: 500 });
    }
    payment = data;
  }

  const balanceUpdate: Record<string, unknown> = {};
  if (payment) {
    balanceUpdate.sessions_total = payment.sessions_purchased;
    balanceUpdate.service_type = payment.service_type;
    if ("payment_type" in update && payment.payment_type !== "pack") {
      balanceUpdate.expires_at = null;
    }
  }
  if (sessions_used !== undefined) {
    const n = Number(sessions_used);
    if (!Number.isInteger(n) || n < 0) {
      return NextResponse.json({ error: "Sesiones usadas inválidas." }, { status: 400 });
    }
    balanceUpdate.sessions_used = n;
  }

  if (Object.keys(balanceUpdate).length > 0) {
    const { data: existing } = await supabase
      .from("fichas_session_balance")
      .select("id, patient_id")
      .eq("payment_id", id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("fichas_session_balance")
        .update(balanceUpdate)
        .eq("id", existing.id);
      if (error) {
        return NextResponse.json({ error: "Error al actualizar saldo de sesiones." }, { status: 500 });
      }
    } else {
      // Pagos sin saldo asociado (no debería pasar, pero se repara aquí).
      const { data: p } = await supabase
        .from("fichas_payments")
        .select("patient_id, sessions_purchased, service_type, payment_type")
        .eq("id", id)
        .single();
      if (p) {
        await supabase.from("fichas_session_balance").insert({
          patient_id: p.patient_id,
          payment_id: id,
          service_type: p.service_type,
          sessions_total: p.sessions_purchased,
          sessions_used: balanceUpdate.sessions_used ?? 0,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, payment });
}

// Eliminar un pago (su saldo de sesiones se borra en cascada).
export async function DELETE(request: NextRequest) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el id del pago." }, { status: 400 });
  }

  const { error } = await getSupabase().from("fichas_payments").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Error al eliminar pago." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
