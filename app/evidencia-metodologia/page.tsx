import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidencia y Metodología",
  description:
    "Cómo evaluamos y en qué nos basamos: mostramos qué tiene evidencia firme, qué es razonamiento clínico y qué sigue siendo debatido.",
};

const evidenceLevels = [
  {
    label: "Evidencia firme",
    color: "bg-emerald-100 text-emerald-800",
    description:
      "Respaldado por estudios clínicos consistentes y consenso profesional amplio.",
    // TODO (Juaco): completar con los puntos específicos que quieres
    // clasificar como evidencia firme en tu práctica.
    items: [
      "El ejercicio progresivo y supervisado mejora la recuperación funcional tras una lesión deportiva.",
    ],
  },
  {
    label: "Razonamiento clínico",
    color: "bg-amber-100 text-amber-800",
    description:
      "Enfoques con base fisiológica razonable y experiencia clínica, sin el mismo nivel de evidencia que lo anterior.",
    items: [
      "La evaluación postural integral (pie, visión, oclusión) como parte del diagnóstico diferencial del dolor recurrente.",
    ],
  },
  {
    label: "Debatido",
    color: "bg-slate-200 text-slate-700",
    description:
      "Temas donde existe divergencia real dentro de la evidencia o la comunidad profesional, y lo decimos explícitamente en vez de simplificarlo.",
    items: [
      "El mecanismo exacto de acción de algunas técnicas manuales osteopáticas sigue en discusión activa en la literatura.",
    ],
  },
];

export default function EvidenciaMetodologiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Evidencia y Metodología</h1>
      <p className="text-slate-600 mb-10">
        Preferimos mostrarte en qué nos basamos, incluyendo lo que todavía está en
        discusión, en vez de presentar todo como si fuera igual de sólido. Así es como
        clasificamos lo que usamos en la práctica clínica.
      </p>

      <div className="space-y-10">
        {evidenceLevels.map((level) => (
          <section key={level.label}>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold mb-3 ${level.color}`}
            >
              {level.label}
            </span>
            <p className="text-slate-600 mb-4">{level.description}</p>
            <ul className="space-y-2">
              {level.items.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700">
                  <span className="text-teal-700">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-slate-500">
        Esta clasificación es un punto de partida y se revisa a medida que aparece
        nueva evidencia. Si tienes dudas sobre un tratamiento específico, pregúntanos
        directamente en tu evaluación.
      </p>
    </div>
  );
}
