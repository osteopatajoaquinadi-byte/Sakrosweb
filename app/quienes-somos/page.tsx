import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Quiénes Somos",
  description:
    "Equipo de osteopatía, kinesiología y posturología en Viña del Mar, dirigido por Joaquín Adi (Juaco), kinesiólogo y osteópata D.O.",
};

export default function QuienesSomosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Joaquín Adi",
    jobTitle: "Kinesiólogo y Osteópata (D.O.)",
    worksFor: {
      "@type": "MedicalBusiness",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Quiénes Somos</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Un equipo de bienestar corporal integral
        </h2>
        <p className="text-slate-600">
          Somos un centro de bienestar corporal integral en Viña del Mar. Trabajamos
          con un equipo de osteópata, posturóloga y kinesiólogos especializados en
          terapias manuales, control motor y movimiento.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          ¿Por qué &quot;a tu medida&quot;?
        </h2>
        <p className="text-slate-600">
          Cada tratamiento parte por una evaluación individualizada: buscamos el
          origen del problema, no solo el síntoma. Evaluamos biomecánica articular,
          integración del sistema nervioso central, hábitos diarios y movimiento.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Formación de nuestro director
        </h2>
        <ul className="space-y-2 text-slate-600">
          <li>Kinesiólogo y Osteópata (D.O.)</li>
          <li>MSc en Psiconeuroinmunología Clínica (PNIc)</li>
          <li>
            Faculty internacional en EOM Internacional (Escuela de Osteopatía de
            Madrid), en los módulos de osteopatía y PNI
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">¿Para quién es Sakros?</h2>
        <p className="text-slate-600">
          Para ex-deportistas y deportistas activos que quieren volver a entrenar sin
          dolor, y en general para cualquier persona que busque una evaluación real
          del origen de su molestia antes de un plan de tratamiento.
        </p>
      </section>
    </div>
  );
}
