import { REST_PROGRAM, REST_TEXTS } from "@/lib/metodo-rest";

// Conversación del bot de Instagram para el Método REST acompañado.
// La lógica no depende de Instagram ni de la base de datos: recibe todo lo
// que necesita en `deps`, lo que permite probarla de forma aislada.

export type BotSlot = { date: string; time: string; [k: string]: unknown };

export type Conversation = {
  ig_user_id: string;
  username: string | null;
  state:
    | "idle" // nunca activó el bot: no se responde (lo atiende Joaquín)
    | "offered" // se le explicó el programa, falta SÍ / NO
    | "ask_name"
    | "ask_email"
    | "ask_phone"
    | "choose_slot"
    | "booked"
    | "declined"
    | "manual"; // sin horas o error: lo sigue Joaquín a mano
  data: { name?: string; email?: string; phone?: string; page?: number; when?: string };
  offered_slots: BotSlot[];
  booking_id: string | null;
};

export type BookResult = { ok: true; bookingId: string; when: string } | { ok: false; reason: "taken" | "error" };

export type BotDeps = {
  send: (text: string) => Promise<void>;
  findSlots: () => Promise<BotSlot[]>;
  book: (conv: Conversation, slot: BotSlot) => Promise<BookResult>;
  formatSlot: (slot: BotSlot) => string;
  paymentUrl: string;
};

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function hasKeyword(text: string): boolean {
  return new RegExp(`(^|[^a-z])${REST_PROGRAM.keyword}s?([^a-z]|$)`).test(normalize(text));
}

const YES = /^(si+|s|sip|dale|ok|okay|okey|claro|quiero|me interesa|acepto|bueno|ya|por supuesto|obvio|de una)([^a-z]|$)/;
const NO = /^(no|nop|nope|todavia no|aun no|mas adelante|no gracias)([^a-z]|$)/;

export function newConversation(igUserId: string, username: string | null = null): Conversation {
  return { ig_user_id: igUserId, username, state: "idle", data: {}, offered_slots: [], booking_id: null };
}

async function offerSlots(conv: Conversation, deps: BotDeps, header: string) {
  const slots = await deps.findSlots();
  if (slots.length === 0) {
    conv.state = "manual";
    await deps.send(REST_TEXTS.noSlots);
    return;
  }
  conv.offered_slots = slots;
  conv.data.page = 0;
  conv.state = "choose_slot";
  await deps.send(pageText(conv, deps, header));
}

function pageText(conv: Conversation, deps: BotDeps, header: string): string {
  const page = conv.data.page ?? 0;
  const per = REST_PROGRAM.slotsPerPage;
  const items = conv.offered_slots.slice(page * per, page * per + per);
  const lines = items.map((s, i) => `${page * per + i + 1}. ${deps.formatSlot(s)}`);
  return `${header}\n\n${lines.join("\n")}\n\n${REST_TEXTS.slotsFooter}`;
}

// Procesa un mensaje directo. Devuelve la conversación actualizada.
export async function handleMessage(conv: Conversation, text: string, deps: BotDeps): Promise<Conversation> {
  const msg = normalize(text);
  const keyword = hasKeyword(text);

  switch (conv.state) {
    case "idle":
    case "declined":
    case "manual":
      if (!keyword) return conv; // no es para el bot
      conv.state = "offered";
      await deps.send(REST_TEXTS.intro);
      return conv;

    case "booked":
      await deps.send(REST_TEXTS.alreadyBooked(conv.data.when ?? "la fecha acordada"));
      return conv;

    case "offered":
      if (YES.test(msg)) {
        conv.state = "ask_name";
        await deps.send(REST_TEXTS.accepted(deps.paymentUrl));
        await deps.send(REST_TEXTS.askName);
      } else if (NO.test(msg)) {
        conv.state = "declined";
        await deps.send(REST_TEXTS.notInterested);
      } else if (keyword) {
        await deps.send(REST_TEXTS.intro);
      } else {
        await deps.send(REST_TEXTS.askYesNo);
      }
      return conv;

    case "ask_name": {
      const name = text.trim().replace(/\s+/g, " ");
      if (name.length < 3 || keyword) {
        await deps.send(REST_TEXTS.askName);
        return conv;
      }
      if (!name.includes(" ")) {
        await deps.send(REST_TEXTS.askLastName);
        conv.data.name = name;
        conv.state = "ask_name";
        return conv;
      }
      conv.data.name = name;
      conv.state = "ask_email";
      await deps.send(REST_TEXTS.askEmail);
      return conv;
    }

    case "ask_email": {
      const email = text.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        await deps.send(REST_TEXTS.badEmail);
        return conv;
      }
      conv.data.email = email;
      conv.state = "ask_phone";
      await deps.send(REST_TEXTS.askPhone);
      return conv;
    }

    case "ask_phone": {
      let digits = text.replace(/\D/g, "");
      if (digits.length === 9 && digits.startsWith("9")) digits = `56${digits}`;
      if (digits.length === 8) digits = `569${digits}`;
      if (digits.length < 10 || digits.length > 15) {
        await deps.send(REST_TEXTS.badPhone);
        return conv;
      }
      conv.data.phone = `+${digits}`;
      await offerSlots(conv, deps, REST_TEXTS.slotsHeader);
      return conv;
    }

    case "choose_slot": {
      if (/^mas([^a-z]|$)/.test(msg) || msg === "+") {
        const next = (conv.data.page ?? 0) + 1;
        if (next * REST_PROGRAM.slotsPerPage >= conv.offered_slots.length) {
          await deps.send(REST_TEXTS.noMoreSlots);
          return conv;
        }
        conv.data.page = next;
        await deps.send(pageText(conv, deps, REST_TEXTS.slotsHeader));
        return conv;
      }
      const n = Number(msg.match(/^\d{1,2}/)?.[0]);
      const page = conv.data.page ?? 0;
      const per = REST_PROGRAM.slotsPerPage;
      if (!n || n < 1 || n > Math.min(conv.offered_slots.length, (page + 1) * per)) {
        await deps.send(REST_TEXTS.badSlot);
        return conv;
      }
      const slot = conv.offered_slots[n - 1];
      const result = await deps.book(conv, slot);
      if (result.ok) {
        conv.state = "booked";
        conv.booking_id = result.bookingId;
        conv.data.when = result.when;
        await deps.send(REST_TEXTS.booked(result.when, deps.paymentUrl));
      } else if (result.reason === "taken") {
        await offerSlots(conv, deps, REST_TEXTS.slotTaken);
      } else {
        conv.state = "manual";
        await deps.send(REST_TEXTS.bookingError);
      }
      return conv;
    }
  }
}
