// Integración opcional con Wix Bookings, para que las reservas del bot de
// Instagram también queden en la agenda de Wix mientras se usen ambas.
// Variables de entorno (Vercel):
//   WIX_API_KEY            API key del sitio (permisos de Wix Bookings)
//   WIX_SITE_ID            id del sitio de Wix
//   WIX_REST_SERVICE_ID    id del servicio de Wix para la sesión del Método REST
// Si falta alguna, el bot trabaja solo con el calendario nuevo.

const WIX_BASE = "https://www.wixapis.com";

export type WixSlot = Record<string, unknown> & { startDate: string; endDate: string };

export function wixConfigured(): boolean {
  return Boolean(
    process.env.WIX_API_KEY && process.env.WIX_SITE_ID && process.env.WIX_REST_SERVICE_ID
  );
}

async function wix(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${WIX_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.WIX_API_KEY!,
      "wix-site-id": process.env.WIX_SITE_ID!,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Wix ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// Horas reservables en Wix entre dos instantes (ISO). Devuelve los slots tal
// como los entrega Wix, para poder reservarlos después.
export async function wixAvailableSlots(fromISO: string, toISO: string, timeZone: string) {
  const data = await wix("/availability-calendar/v1/availability-calendar/query", {
    query: {
      filter: {
        serviceId: [process.env.WIX_REST_SERVICE_ID],
        startDate: fromISO,
        endDate: toISO,
        bookable: true,
      },
    },
    timezone: timeZone,
  });
  const entries = (data.availabilityEntries as { slot: WixSlot; bookable?: boolean }[]) ?? [];
  return entries.filter((e) => e.bookable !== false).map((e) => e.slot);
}

// Crea y confirma la reserva en Wix. Lanza error si Wix la rechaza.
export async function wixCreateBooking(
  slot: WixSlot,
  contact: { name: string; email: string; phone: string }
): Promise<string> {
  const [firstName, ...rest] = contact.name.trim().split(/\s+/);
  const created = await wix("/bookings/v2/bookings", {
    booking: {
      bookedEntity: { slot },
      contactDetails: {
        firstName,
        lastName: rest.join(" ") || undefined,
        email: contact.email,
        phone: contact.phone,
      },
      totalParticipants: 1,
      selectedPaymentOption: "OFFLINE",
    },
    participantNotification: { notifyParticipants: true },
  });
  const booking = created.booking as { id: string; revision?: string; status?: string } | undefined;
  if (!booking?.id) throw new Error("Wix no devolvió el id de la reserva.");

  if (booking.status !== "CONFIRMED") {
    try {
      await wix(`/bookings/v2/confirmation/${booking.id}:confirmOrDecline`, {
        paymentStatus: "NOT_PAID",
      });
    } catch {
      // Queda creada en Wix aunque no se haya podido confirmar automáticamente.
    }
  }
  return booking.id;
}
