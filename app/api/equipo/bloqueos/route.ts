import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const MAX_DIAS = 62;

// Bloquear un horario de un profesional (uno o varios días seguidos).
// La agenda online ya no ofrece esas horas.
export async function POST(request: NextRequest) {
  const { user, denied } = requireStaff(request, "agendar");
  if (denied) return denied;

  const body = await request.json();
  const { professional_id, date, date_to, all_day, start_time, end_time, reason } = body;

  if (!professional_id || !DATE_RE.test(date ?? "")) {
    return NextResponse.json({ error: "Indica profesional y fecha." }, { status: 400 });
  }
  const hasta = date_to && DATE_RE.test(date_to) ? date_to : date;
  if (hasta < date) {
    return NextResponse.json({ error: "La fecha final es anterior a la inicial." }, { status: 400 });
  }
  if (!all_day && (!TIME_RE.test(start_time ?? "") || !TIME_RE.test(end_time ?? "") || end_time <= start_time)) {
    return NextResponse.json({ error: "Revisa el horario: la hora de término debe ser posterior al inicio." }, { status: 400 });
  }
  if (!String(reason ?? "").trim()) {
    return NextResponse.json({ error: "Escribe el motivo del bloqueo." }, { status: 400 });
  }

  const dias: string[] = [];
  const fin = new Date(`${hasta}T12:00:00Z`);
  for (let d = new Date(`${date}T12:00:00Z`); d <= fin; d.setUTCDate(d.getUTCDate() + 1)) {
    dias.push(d.toISOString().slice(0, 10));
    if (dias.length > MAX_DIAS) {
      return NextResponse.json({ error: `Máximo ${MAX_DIAS} días por bloqueo.` }, { status: 400 });
    }
  }

  const motivo = `${String(reason).trim()} · por ${user.display_name}`;
  const rows = dias.map((d) => ({
    professional_id,
    block_date: d,
    start_time: all_day ? null : start_time,
    end_time: all_day ? null : end_time,
    reason: motivo,
  }));

  const supabase = getSupabase();
  const { data, error } = await supabase.from("schedule_blocks").insert(rows).select("id");
  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el bloqueo." }, { status: 500 });
  }

  // Avisar si ya había citas en ese horario (no se cancelan solas).
  const { data: citas } = await supabase
    .from("bookings")
    .select("booking_date, start_time, end_time, client_name")
    .eq("professional_id", professional_id)
    .gte("booking_date", date)
    .lte("booking_date", hasta)
    .neq("status", "cancelled")
    .order("booking_date")
    .order("start_time");
  const choques = (citas ?? []).filter(
    (c) => all_day || (c.start_time.slice(0, 5) < end_time && c.end_time.slice(0, 5) > start_time)
  );

  return NextResponse.json({
    created: data?.length ?? 0,
    conflicts: choques.map((c) => ({
      date: c.booking_date,
      time: c.start_time.slice(0, 5),
      client_name: c.client_name,
    })),
  });
}

// Quitar un bloqueo.
export async function DELETE(request: NextRequest) {
  const { denied } = requireStaff(request, "agendar");
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  const { error } = await getSupabase().from("schedule_blocks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "No se pudo quitar el bloqueo." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
