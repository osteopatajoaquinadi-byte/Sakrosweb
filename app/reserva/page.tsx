import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFlow from "@/components/BookingFlow";

export const metadata: Metadata = {
  title: "Reserva tu hora",
  description:
    "Reserva online tu hora de osteopatía, kinesiología, posturología o estudio biomecánico en Sakros, Viña del Mar.",
};

export default function ReservaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Reserva tu hora</h1>
      <p className="text-slate-600 mb-8">
        Elige el servicio, la fecha y la hora que más te acomode. La reserva queda
        confirmada de inmediato y te enviamos los detalles por email.
      </p>
      <Suspense fallback={<p className="text-slate-500">Cargando...</p>}>
        <BookingFlow />
      </Suspense>
    </div>
  );
}
