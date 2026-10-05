import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";
import { Resend } from "resend";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { sendProfessionalInvites } from "@/lib/calendar-invite";

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

  // Paciente nuevo: se reutiliza su ficha si ya existe una con el mismo
  // email o teléfono; si no, se crea una. Así todas las sesiones (incluido
  // un programa completo) quedan en una sola ficha.
  let fichaId: string | null = patient_id || null;
  if (!fichaId) {
    const lookups: [string, string | undefined][] = [
      ["email", client_email],
      ["phone", client_phone],
    ];
    for (const [column, value] of lookups) {
      if (fichaId || !value) continue;
      const { data: match } = await db
        .from("fichas_patients")
        .select("id")
        .eq(column as "email", String(value))
        .limit(1);
      fichaId = (match?.[0] as { id: string } | undefined)?.id ?? null;
    }
    if (!fichaId) {
      const { data: created } = await db
        .from("fichas_patients")
        .insert({
          name: client_name,
          email: client_email || null,
          phone: client_phone || null,
          created_by: user.username,
          notes: "Creado desde la agenda del panel",
        })
        .select("id")
        .single();
      fichaId = created?.id ?? null;
    }
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

  // Programa: varias sesiones, una cada `every_days` días desde la fecha
  // inicial. Una sesión suelta es un programa de 1.
  const count = Math.min(Math.max(parseInt(body.sessions_count) || 1, 1), 52);
  const everyDays = Math.min(Math.max(parseInt(body.every_days) || 7, 1), 60);
  const isProgram = count > 1;
  const dates: string[] = [];
  const start = new Date(`${booking_date}T12:00:00Z`);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i * everyDays);
    dates.push(d.toISOString().slice(0, 10));
  }

  const { data: clashes } = await db
    .from("bookings")
    .select("booking_date")
    .eq("professional_id", professional_id)
    .in("booking_date", dates)
    .eq("start_time", start_time)
    .eq("status", "confirmed");
  if (clashes && clashes.length > 0 && !body.allow_overlap) {
    const list = [...new Set(clashes.map((c) => c.booking_date))].sort().join(", ");
    return NextResponse.json(
      { error: `Ese profesional ya tiene reserva a esa hora el ${list}.`, overlap: true },
      { status: 409 }
    );
  }

  const baseNote = [notes, `Agendado desde el panel por ${user.display_name}`].filter(Boolean);
  const rows = dates.map((date, i) => ({
    professional_id,
    service_id,
    booking_date: date,
    start_time,
    end_time,
    client_name,
    client_email: client_email || "",
    client_phone: client_phone || null,
    status: "confirmed",
    payment_status: "pending",
    notes: [isProgram ? `Programa: sesión ${i + 1} de ${count}` : null, ...baseNote]
      .filter(Boolean)
      .join(" · "),
  }));

  const { data: created, error } = await db.from("bookings").insert(rows).select("id");

  if (error || !created) {
    return NextResponse.json({ error: "Error al crear la reserva." }, { status: 500 });
  }

  // El trigger de la BD vincula por email/teléfono; se fija la ficha
  // elegida (evita confusiones con correos compartidos).
  const ids = created.map((b) => b.id);
  if (fichaId) {
    await db
      .from("bookings")
      .update({ ficha_patient_id: fichaId, fichas_patient_id: fichaId })
      .in("id", ids);
  }

  // Confirmación al paciente, igual que en la reserva pública. Si falla el
  // envío la reserva queda creada igual: el correo es un aviso, no un requisito.
  let emailed = false;
  if (body.notify !== false && client_email && calendarNotificationsEnabled()) {
    try {
      const [{ data: svc }, { data: pro }] = await Promise.all([
        db.from("services").select("name").eq("id", service_id).single(),
        db.from("professionals").select("name").eq("id", professional_id).single(),
      ]);
      const fmt = (d: string) =>
        new Date(`${d}T12:00:00`).toLocaleDateString("es-CL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: mailErr } = await resend.emails.send({
        from: emailFrom("Sakros"),
        to: client_email,
        replyTo: siteConfig.email,
        subject: isProgram
          ? `Tu programa en Sakros — ${svc?.name ?? ""}, ${count} sesiones`
          : `Tu reserva en Sakros — ${svc?.name ?? ""} el ${fmt(dates[0])}`,
        text: [
          `Hola ${client_name},`,
          "",
          isProgram ? `Agendamos tu programa de ${count} sesiones:` : "Tu reserva quedó registrada:",
          "",
          `Servicio: ${svc?.name ?? ""}`,
          `Profesional: ${pro?.name ?? ""}`,
          `Hora: ${start_time} - ${end_time}`,
          ...(isProgram
            ? ["", "Fechas:", ...dates.map((d, i) => `  ${i + 1}. ${fmt(d)}`)]
            : [`Fecha: ${fmt(dates[0])}`]),
          "",
          `Dirección: ${siteConfig.address.street}, ${siteConfig.address.city}`,
          "",
          "Política de cancelación: puedes cancelar o reprogramar hasta 24 horas antes sin costo.",
          `¿Necesitas cambiar la hora? Escríbenos al WhatsApp ${siteConfig.phone}.`,
          "",
          "— Equipo Sakros",
        ].join("\n"),
      });
      if (mailErr) console.error("Confirmación panel:", mailErr.message);
      else emailed = true;
    } catch (e) {
      console.error("Confirmación panel:", e);
    }
  }

  // Cada sesión llega como invitación al calendario del profesional.
  await sendProfessionalInvites(db, ids, "new");

  return NextResponse.json({ ok: true, ids, dates, emailed });
}

const STATUSES = ["confirmed", "cancelled", "completed", "no_show"];
const PAYMENT_STATUSES = ["pending", "paid", "refunded"];

// Editar una reserva: cambiar estado (cancelar, asistió, no asistió) y/o
// reagendar (fecha, hora, profesional, servicio) y notas.
export async function PATCH(request: NextRequest) {
  const { denied } = requireStaff(request, "agendar");
  if (denied) return denied;

  const body = await request.json();
  const { id, status, payment_status } = body;
  if (
    !id ||
    (status !== undefined && !STATUSES.includes(status)) ||
    (payment_status !== undefined && !PAYMENT_STATUSES.includes(payment_status))
  ) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const db = getServiceClient();
  const { data: current } = await db
    .from("bookings")
    .select("booking_date, start_time, professional_id, service_id, status")
    .eq("id", id)
    .single();
  if (!current) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
  if (status !== undefined) {
    update.status = status;
    update.cancelled_at = status === "cancelled" ? new Date().toISOString() : null;
  }
  if (typeof body.notes === "string") update.notes = body.notes;
  if (payment_status !== undefined) update.payment_status = payment_status;

  const booking_date = body.booking_date ?? current.booking_date;
  const start_time = String(body.start_time ?? current.start_time).slice(0, 5);
  const professional_id = body.professional_id ?? current.professional_id;
  const service_id = body.service_id ?? current.service_id;
  const rescheduling =
    booking_date !== current.booking_date ||
    start_time !== String(current.start_time).slice(0, 5) ||
    professional_id !== current.professional_id ||
    service_id !== current.service_id;

  if (rescheduling) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date) || !/^\d{2}:\d{2}$/.test(start_time)) {
      return NextResponse.json({ error: "Fecha u hora inválida." }, { status: 400 });
    }
    const { data: service } = await db
      .from("services")
      .select("duration_minutes")
      .eq("id", service_id)
      .single();
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    const { data: clashes } = await db
      .from("bookings")
      .select("id")
      .eq("professional_id", professional_id)
      .eq("booking_date", booking_date)
      .eq("start_time", start_time)
      .eq("status", "confirmed")
      .neq("id", id);
    if (clashes && clashes.length > 0 && !body.allow_overlap) {
      return NextResponse.json(
        { error: "Ese profesional ya tiene una reserva a esa hora.", overlap: true },
        { status: 409 }
      );
    }

    const [h, m] = start_time.split(":").map(Number);
    const end = h * 60 + m + service.duration_minutes;
    Object.assign(update, {
      booking_date,
      start_time,
      end_time: `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`,
      professional_id,
      service_id,
    });
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await db.from("bookings").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Error al actualizar la reserva." }, { status: 500 });
  }

  // Mantener al día el calendario del profesional.
  const newStatus = status ?? current.status;
  if (newStatus === "cancelled" && current.status !== "cancelled") {
    await sendProfessionalInvites(db, [id], "cancel");
  } else if (newStatus === "confirmed" && current.status === "cancelled") {
    await sendProfessionalInvites(db, [id], "new");
  } else if (rescheduling && newStatus !== "cancelled") {
    if (professional_id !== current.professional_id) {
      await sendProfessionalInvites(db, [id], "cancel", current.professional_id);
      await sendProfessionalInvites(db, [id], "new");
    } else {
      await sendProfessionalInvites(db, [id], "update");
    }
  }
  return NextResponse.json({ ok: true });
}
