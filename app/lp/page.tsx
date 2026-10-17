import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sakros — Agenda tu evaluación",
  description:
    "Osteopatía, kinesiología deportiva y posturología clínica en Viña del Mar. Elige tu servicio y agenda tu evaluación.",
  robots: { index: false, follow: false },
};

const SERVICIOS = [
  {
    slug: "osteopatia",
    title: "Osteopatía + PNI Clínica",
    desc: "Dolor crónico, cefaleas, problemas digestivos o fatiga que no mejoran con tratamientos habituales.",
    emoji: "🦴",
    utm: "osteopatia",
  },
  {
    slug: "kinesiologia",
    title: "Kinesiología Deportiva",
    desc: "Lesiones que vuelven, miedo a entrenar o rehabilitación que se quedó en la camilla.",
    emoji: "🏃",
    utm: "kinesiologia",
  },
  {
    slug: "posturologia",
    title: "Posturología Clínica",
    desc: "Dificultades de atención, coordinación o postura en niños. Rendimiento deportivo en adultos.",
    emoji: "🧠",
    utm: "posturologia",
  },
] as const;

export default function LinkEnBioPage() {
  return (
    <div className="bg-gradient-to-b from-teal-900 to-teal-800 min-h-[80vh] flex items-center">
      <div className="mx-auto max-w-md w-full px-4 py-12">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <p className="text-teal-300 text-sm font-semibold uppercase tracking-wide mb-2">
            Clínica Sakros · Viña del Mar
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">
            ¿Qué necesitas resolver?
          </h1>
          <p className="text-teal-200 text-sm">
            Elige tu servicio y agenda una evaluación sin compromiso.
          </p>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          {SERVICIOS.map((s) => (
            <Link
              key={s.slug}
              href={`/lp/${s.slug}?utm_source=instagram&utm_medium=bio&utm_campaign=link_en_bio`}
              className="block rounded-2xl bg-white p-5 hover:ring-2 hover:ring-teal-400 transition group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{s.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition">
                    {s.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* WhatsApp directo */}
        <div className="mt-6 text-center">
          <a
            href="https://wa.me/56945399692?text=Hola%2C%20quiero%20agendar%20una%20evaluaci%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700/50 transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            O escríbenos directo por WhatsApp
          </a>
        </div>

        {/* Dirección */}
        <p className="mt-8 text-center text-xs text-teal-300/60">
          9 Norte 555, Edificio Emporium, Of. 201 · Viña del Mar
        </p>
      </div>
    </div>
  );
}
