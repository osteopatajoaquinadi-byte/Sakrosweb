import type { Metadata } from "next";
import { Suspense } from "react";
import CampaignLeadForm from "@/components/CampaignLeadForm";

export const metadata: Metadata = {
  title: "Kinesiología Deportiva en Viña del Mar | Sakros",
  description:
    "¿Lesión que no termina de sanar o miedo a volver a entrenar? Rehabilitación y readaptación deportiva con progresión real en Viña del Mar.",
  robots: { index: false, follow: false },
};

export default function KinesiologiaLandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-teal-900 to-teal-800 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 text-center">
          <p className="text-teal-300 text-sm font-semibold uppercase tracking-wide mb-4">
            Kinesiología y Readaptación Deportiva en Viña del Mar
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
            ¿Tu lesión mejoró pero no te atreves a volver a entrenar como antes?
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8">
            Entre &ldquo;ya no me duele&rdquo; y &ldquo;ya puedo entrenar como antes&rdquo; hay
            una etapa que la rehabilitación tradicional no cubre. Nosotros sí.
          </p>
          <a
            href="#formulario"
            className="inline-block rounded-full bg-white text-teal-900 px-8 py-4 text-base font-bold hover:bg-teal-50 transition"
          >
            Quiero agendar mi evaluación
          </a>
        </div>
      </section>

      {/* ── Puntos de dolor ──────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Esto le pasa a la mayoría de los deportistas lesionados
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">🛑</p>
            <h3 className="font-semibold text-slate-900 mb-2">Entrenas con el freno de mano</h3>
            <p className="text-sm text-slate-600">
              La molestia bajó, pero no confías en tu rodilla, tu hombro o tu
              espalda. Entrenas a media máquina por miedo a romperte de nuevo.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">🔁</p>
            <h3 className="font-semibold text-slate-900 mb-2">La lesión vuelve cada cierto tiempo</h3>
            <p className="text-sm text-slate-600">
              Mejoras, vuelves al deporte, y a las semanas el dolor reaparece.
              El ciclo se repite porque la causa de fondo no se resolvió.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">😤</p>
            <h3 className="font-semibold text-slate-900 mb-2">Te dejaron en la camilla</h3>
            <p className="text-sm text-slate-600">
              40 minutos de electrodos y ultrasonido. Ni una sentadilla, ni un
              gesto de tu deporte. Cuando preguntas cuándo puedes volver, no hay
              respuesta clara.
            </p>
          </div>
        </div>
      </section>

      {/* ── Lo que hacemos diferente ─────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Rehabilitación que termina en tu deporte, no en la camilla
          </h2>
          <p className="text-slate-600 mb-8">
            Nuestro enfoque tiene 4 fases con criterios claros para avanzar.
            No son sesiones aisladas — es un proceso que te lleva desde el dolor
            hasta la vuelta al entrenamiento con confianza.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3 items-start">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-sm">1</div>
              <div>
                <p className="font-semibold text-slate-900">Evaluación manual y funcional</p>
                <p className="text-sm text-slate-600">
                  Identificamos las compensaciones y restricciones que explican
                  por qué el dolor persiste o vuelve.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-sm">2</div>
              <div>
                <p className="font-semibold text-slate-900">Modulación del dolor</p>
                <p className="text-sm text-slate-600">
                  Terapia manual avanzada para devolverte rango de movimiento
                  y bajar la respuesta inflamatoria.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-sm">3</div>
              <div>
                <p className="font-semibold text-slate-900">Control motor</p>
                <p className="text-sm text-slate-600">
                  Reentrenamos los patrones que tu cuerpo perdió o compensó
                  durante la lesión.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-sm">4</div>
              <div>
                <p className="font-semibold text-slate-900">Carga progresiva y vuelta al deporte</p>
                <p className="text-sm text-slate-600">
                  Fortalecimiento con gestos de tu deporte. Criterios claros
                  de cuándo puedes subir la intensidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Credenciales ─────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 text-center">
            <p className="text-sm font-bold text-teal-900">Kinesiólogo</p>
            <p className="text-xs text-teal-700 mt-1">
              Rehabilitación y readaptación deportiva
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 text-center">
            <p className="text-sm font-bold text-teal-900">D.O. Osteopatía</p>
            <p className="text-xs text-teal-700 mt-1">
              Terapia manual avanzada — formación internacional
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 text-center">
            <p className="text-sm font-bold text-teal-900">Progresión medible</p>
            <p className="text-xs text-teal-700 mt-1">
              Seguimiento sesión a sesión con criterios de avance
            </p>
          </div>
        </div>
      </section>

      {/* ── Formulario ───────────────────────────────────── */}
      <section id="formulario" className="bg-slate-50 border-y border-slate-200 scroll-mt-4">
        <div className="mx-auto max-w-lg px-4 py-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Agenda tu evaluación
            </h2>
            <p className="text-slate-600">
              Completa estos datos y te contactamos por WhatsApp para confirmar
              tu hora. Sin compromiso.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <Suspense fallback={<p className="text-center text-slate-500">Cargando formulario...</p>}>
              <CampaignLeadForm servicio="kinesiologia" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Ubicación ────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <p className="text-sm text-slate-500 mb-2">Estamos en</p>
        <p className="font-semibold text-slate-900">
          9 Norte 555, Edificio Emporium, Of. 201
        </p>
        <p className="text-slate-600">Viña del Mar, Región de Valparaíso</p>
      </section>
    </div>
  );
}
