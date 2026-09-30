import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

// Agenda interna del panel: a diferencia de /api/bookings (reserva pública),
// permite agendar fuera de los horarios publicados y vincular la reserva a
// una ficha existente.

// Profesionales, servicios y combinaciones válidas para el formulario.
export async function GET(request: NextRequest) {
  const { denied } = requireStaff(request, "agendar");
  if (denied) return denied;

  const db = getServiceClient();
  const [pros, svcs, links] = await Promise.all([
    db.from("professionals").select("id, name, slug").order("name"),
    db.from("services").select("id, name, slug, duration_minutes").eq("active", true).order("name"),
    db.from("professional_services").select("professional_id, service_id"),
  ]);

  return NextResponse.json({
    professionals: pros.data ?? [],
    services: svcs.data ?? [],
    links: links.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const { user, denied } = requireStaff(request, "agendar");
  if (denied) return denied;

  const body = await request.json();
  const { patient_id, professional_id, service_id, booking_date, start_time, notes } = body;
  let { client_name, client_email, client_phone } = body;

  if (!professional_id || !service_id || !booking_date || !start_time) {
    return NextResponse.json({ error: "Faltan profesional, servicio, fecha u hora." }, { status: 400 });
  }

  const db = getServiceClient();

  if (patient_id) {
    const { data: patient } = await db
      .from("fichas_patients")
      .select("name, email, phone")
      .eq("id", patient_id)
      .single();
    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
    }
    client_name = patient.name;
    client_email = patient.email;
    client_phone = patient.phone;
  }

  if (!client_name) {
    return NextResponse.json({ error: "Elige un paciente o ingresa el nombre." }, { status: 400 });
  }

  const { data: service } = await db
    .from("services")
    .select("duration_minutes")
    .eq("id", service_id)
    .single();
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
  }

  const [h, m] = String(start_time).split(":").map(Number);
  const end = h * 60 + m + service.duration_minutes;
  const end_time = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;

  const { data: clash } = await db
    .from("bookings")
    .select("id")
    .eq("professional_id", professional_id)
    .eq("booking_date", booking_date)
    .eq("start_time", start_time)
    .eq("status", "confirmed")
    .limit(1);
  if (clash && clash.length > 0 && !body.allow_overlap) {
    return NextResponse.json(
      { error: "Ese profesional ya tiene una reserva a esa hora.", overlap: true },
      { status: 409 }
    );
  }

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      professional_id,
      service_id,
      booking_date,
      start_time,
      end_time,
      client_name,
      client_email: client_email || "",
      client_phone: client_phone || null,
      status: "confirmed",
      payment_status: "pending",
      notes: [notes, `Agendado desde el panel por ${user.display_name}`].filter(Boolean).join(" · "),
    })
    .select("id")
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Error al crear la reserva." }, { status: 500 });
  }

  // El trigger de la BD vincula por email/teléfono; si se eligió una ficha
  // concreta, se fija esa (evita confusiones con correos compartidos).
  if (patient_id) {
    await db
      .from("bookings")
      .update({ ficha_patient_id: patient_id, fichas_patient_id: patient_id })
      .eq("id", booking.id);
  }

  return NextResponse.json({ ok: true, id: booking.id });
}

const STATUSES = ["confirmed", "cancelled", "completed", "no_show"];

// Cambiar estado de una reserva (cancelar, marcar asistida o no asistió).
export async function PATCH(request: NextRequest) {
  const { denied } = requireStaff(request, "agendar");
  if (denied) return denied;

  const { id, status } = await request.json();
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { error } = await getServiceClient()
    .from("bookings")
    .update({
      status,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Error al actualizar la reserva." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
