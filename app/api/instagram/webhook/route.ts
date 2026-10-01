import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { siteConfig } from "@/lib/site-config";
import { REST_PROGRAM, REST_TEXTS } from "@/lib/metodo-rest";
import {
  instagramConfigured,
  replyToComment,
  sendDirectMessage,
  sendPrivateReply,
  verifySignature,
} from "@/lib/instagram";
import {
  handleMessage,
  hasKeyword,
  newConversation,
  type BookResult,
  type BotDeps,
  type BotSlot,
  type Conversation,
} from "@/lib/ig-bot";
import { findRestSlots, formatSlot } from "@/lib/rest-availability";
import { wixCreateBooking, type WixSlot } from "@/lib/wix-bookings";

// Webhook de Instagram (Meta). Responde DMs y comentarios con la palabra
// "sueño" ofreciendo el Método REST acompañado y agendando la sesión.

// Verificación del webhook al registrarlo en Meta.
export async function GET(request: NextRequest) {
  const p = new URL(request.url).searchParams;
  if (
    p.get("hub.mode") === "subscribe" &&
    process.env.IG_VERIFY_TOKEN &&
    p.get("hub.verify_token") === process.env.IG_VERIFY_TOKEN
  ) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

type MessagingEvent = {
  sender?: { id: string };
  message?: { mid?: string; text?: string; is_echo?: boolean };
};
type CommentChange = {
  field: string;
  value?: { id?: string; text?: string; from?: { id: string; username?: string } };
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!instagramConfigured() || !verifySignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(raw) as {
    entry?: { id: string; messaging?: MessagingEvent[]; changes?: CommentChange[] }[];
  };

  for (const entry of payload.entry ?? []) {
    for (const ev of entry.messaging ?? []) {
      const text = ev.message?.text;
      const sender = ev.sender?.id;
      if (!text || !sender || ev.message?.is_echo || sender === entry.id) continue;
      try {
        if (await alreadyProcessed(ev.message?.mid ?? null)) continue;
        await onDirectMessage(sender, text);
      } catch (err) {
        console.error("IG bot DM error", err);
      }
    }

    for (const change of entry.changes ?? []) {
      const c = change.value;
      if (change.field !== "comments" || !c?.id || !c.text || !c.from?.id) continue;
      if (c.from.id === entry.id || !hasKeyword(c.text)) continue;
      try {
        if (await alreadyProcessed(`comment:${c.id}`)) continue;
        await onComment(c.id, c.from.id, c.from.username ?? null, c.text);
      } catch (err) {
        console.error("IG bot comment error", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function alreadyProcessed(eventId: string | null): Promise<boolean> {
  if (!eventId) return false;
  const { error } = await getServiceClient().from("ig_processed_events").insert({ event_id: eventId });
  return Boolean(error); // conflicto de clave = ya procesado
}

async function loadConversation(igUserId: string, username: string | null): Promise<Conversation> {
  const { data } = await getServiceClient()
    .from("ig_conversations")
    .select("ig_user_id, username, state, data, offered_slots, booking_id")
    .eq("ig_user_id", igUserId)
    .maybeSingle();
  const conv = (data as Conversation | null) ?? newConversation(igUserId, username);
  if (username && !conv.username) conv.username = username;
  return conv;
}

async function saveConversation(conv: Conversation) {
  await getServiceClient()
    .from("ig_conversations")
    .upsert({ ...conv, updated_at: new Date().toISOString() });
}

async function log(igUserId: string, direction: "in" | "out", channel: "dm" | "comment", text: string) {
  await getServiceClient().from("ig_messages").insert({ ig_user_id: igUserId, direction, channel, text });
}

function deps(igUserId: string): BotDeps {
  return {
    paymentUrl: REST_PROGRAM.paymentUrl,
    formatSlot: (s) => formatSlot(s),
    findSlots: async () => (await findRestSlots(getServiceClient())) as BotSlot[],
    book: (conv, slot) => bookSession(conv, slot),
    send: async (text) => {
      await sendDirectMessage(igUserId, text);
      await log(igUserId, "out", "dm", text);
    },
  };
}

async function onDirectMessage(igUserId: string, text: string) {
  const conv = await loadConversation(igUserId, null);
  // Conversación normal (no activó el bot, lo rechazó o la sigue Joaquín): no se toca.
  if (["idle", "declined", "manual"].includes(conv.state) && !hasKeyword(text)) return;
  await log(igUserId, "in", "dm", text);
  const updated = await handleMessage(conv, text, deps(igUserId));
  await saveConversation(updated);
}

async function onComment(commentId: string, igUserId: string, username: string | null, text: string) {
  const conv = await loadConversation(igUserId, username);
  await log(igUserId, "in", "comment", text);
  await replyToComment(commentId, REST_TEXTS.commentPublicReply);
  await log(igUserId, "out", "comment", REST_TEXTS.commentPublicReply);

  if (conv.state === "booked") {
    await sendPrivateReply(commentId, REST_TEXTS.alreadyBooked(conv.data.when ?? "la fecha acordada"));
    return;
  }
  // Si estaba a mitad del proceso se retoma desde la explicación.
  await sendPrivateReply(commentId, REST_TEXTS.intro);
  await log(igUserId, "out", "dm", REST_TEXTS.intro);
  conv.state = "offered";
  await saveConversation(conv);
}

// Reserva en el calendario nuevo y, si está conectado, también en Wix.
async function bookSession(conv: Conversation, chosen: BotSlot): Promise<BookResult> {
  const db = getServiceClient();
  const { name, email, phone } = conv.data;
  if (!name || !email || !phone) return { ok: false, reason: "error" };

  // Revalida con la disponibilidad actual (la hora pudo ocuparse).
  const fresh = await findRestSlots(db);
  const slot = fresh.find((s) => s.date === chosen.date && s.time === chosen.time);
  if (!slot) return { ok: false, reason: "taken" };

  const [{ data: pro }, { data: service }] = await Promise.all([
    db.from("professionals").select("id, name").eq("slug", REST_PROGRAM.professionalSlug).single(),
    db.from("services").select("id, name, duration_minutes").eq("slug", REST_PROGRAM.serviceSlug).single(),
  ]);
  if (!pro || !service) return { ok: false, reason: "error" };

  const [h, m] = slot.time.split(":").map(Number);
  const end = h * 60 + m + service.duration_minutes;
  const endTime = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
  const handle = conv.username ? `@${conv.username}` : `IG ${conv.ig_user_id}`;
  const notes = [`Método REST acompañado · agendado por el bot de Instagram (${handle})`];

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      professional_id: pro.id,
      service_id: service.id,
      booking_date: slot.date,
      start_time: slot.time,
      end_time: endTime,
      client_name: name,
      client_email: email,
      client_phone: phone,
      status: "confirmed",
      payment_status: "pending",
      notes: notes.join(" · "),
    })
    .select("id")
    .single();
  if (error || !booking) {
    console.error("IG bot booking error", error);
    return { ok: false, reason: "error" };
  }

  if (slot.wixSlot) {
    try {
      const wixId = await wixCreateBooking(slot.wixSlot as WixSlot, { name, email, phone });
      notes.push(`Wix: ${wixId}`);
    } catch (err) {
      notes.push(`⚠ No se pudo crear en Wix: ${(err as Error).message.slice(0, 200)}`);
    }
    await db.from("bookings").update({ notes: notes.join(" · ") }).eq("id", booking.id);
  }

  const when = formatSlot(slot);
  await notifyClinic({ name, email, phone, when, handle, notes: notes.join("\n") });
  return { ok: true, bookingId: booking.id, when };
}

async function notifyClinic(info: { name: string; email: string; phone: string; when: string; handle: string; notes: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await new Resend(apiKey).emails.send({
      from: "Sakros Web <onboarding@resend.dev>",
      to: siteConfig.email,
      subject: `Método REST — nueva sesión agendada por Instagram (${info.name})`,
      text: [
        `El bot de Instagram agendó una sesión online del Método REST acompañado.`,
        "",
        `Paciente: ${info.name}`,
        `Instagram: ${info.handle}`,
        `Email: ${info.email}`,
        `WhatsApp: ${info.phone}`,
        `Sesión: ${info.when}`,
        `Pago: pendiente (link enviado por DM)`,
        "",
        info.notes,
      ].join("\n"),
    });
  } catch (err) {
    console.error("IG bot notify error", err);
  }
}
