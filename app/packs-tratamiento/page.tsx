import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Packs de Tratamiento",
  description: "Packs de sesiones de osteopatía, kinesiología y posturología en Sakros.",
};

// TODO (Juaco): estos packs son placeholder de estructura. Reemplaza
// nombre, número de sesiones y precio real antes de publicar.
const packs = [
  {
    name: "Evaluación inicial",
    sessions: "1 sesión",
    price: "Consultar",
    description: "Evaluación biomecánica y postural completa, punto de partida de cualquier plan.",
  },
  {
    name: "Pack recuperación",
    sessions: "4 sesiones",
    price: "Consultar",
    description: "Para lesiones puntuales o dolor recurrente en tratamiento activo.",
  },
  {
    name: "Pack vuelta al deporte",
    sessions: "8 sesiones",
    price: "Consultar",
    description:
      "Combina tratamiento manual y actividad física dirigida para la etapa de readaptación de carga.",
  },
];

export default function PacksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Packs de Tratamiento</h1>
      <p className="text-slate-600 max-w-2xl mb-10">
        Estructura orientativa. Los precios y el pack más adecuado se confirman en tu
        evaluación inicial.
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        {packs.map((pack) => (
          <div key={pack.name} className="rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-1">{pack.name}</h2>
            <p className="text-sm text-teal-700 mb-3">{pack.sessions}</p>
            <p className="text-sm text-slate-600 mb-4">{pack.description}</p>
            <p className="text-lg font-bold text-slate-900">{pack.price}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <a
          href={siteConfig.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
