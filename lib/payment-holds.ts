// Libera las horas con pago online que no se pagaron dentro del plazo.
// Se ejecuta al consultar disponibilidad y al reservar, así la hora vuelve
// a estar disponible apenas vence el plazo, sin depender de un cron.
import { getServiceClient } from "@/lib/supabase";
import { sendProfessionalInvites } from "@/lib/calendar-invite";

type Db = ReturnType<typeof getServiceClient>;

export async function releaseExpiredHolds(db: Db): Promise<void> {
  try {
    const { data } = await db
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("status", "confirmed")
      .eq("payment_status", "pending")
      .lt("payment_expires_at", new Date().toISOString())
      .select("id, notes");
    if (!data || data.length === 0) return;
    await Promise.all(
      data.map((b) =>
        db
          .from("bookings")
          .update({ notes: [b.notes, "Liberada: pago online no completado"].filter(Boolean).join(" · ") })
          .eq("id", b.id)
      )
    );
    await sendProfessionalInvites(db, data.map((b) => b.id), "cancel");
  } catch (e) {
    console.error("Liberar horas sin pago:", e);
  }
}
