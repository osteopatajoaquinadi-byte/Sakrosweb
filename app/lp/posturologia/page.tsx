import type { Metadata } from "next";
import { Suspense } from "react";
import CampaignLeadForm from "@/components/CampaignLeadForm";

export const metadata: Metadata = {
  title: "Posturología Clínica en Viña del Mar | Sakros",
  description:
    "Evaluación clínica del sistema nervioso central y su influencia en postura, desarrollo motor, desempeño escolar y rendimiento deportivo. Viña del Mar.",
  robots: { index: false, follow: false },
};

export default function PosturologiaLandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-teal-900 to-teal-800 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 text-center">
          <p className="text-teal-300 text-sm font-semibold uppercase tracking-wide mb-4">
            Posturología Clínica en Viña del Mar
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
            ¿Tu hijo tiene dificultades de atención, coordinación o postura que no mejoran con los tratamientos habituales?
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8">
            Muchos de estos problemas tienen un origen sensorial que los
            tratamientos convencionales no evalúan. La posturología clínica
            analiza cómo el sistema nervioso central procesa la información
            que recibe de los ojos, los pies y el sistema musculoesquelético.
          </p>
          <a
            href="#formulario"
            className="inline-block rounded-full bg-white text-teal-900 px-8 py-4 text-base font-bold hover:bg-teal-50 transition"
          >
            Quiero agendar una evaluación
          </a>
        </div>
      </section>

      {/* ── A quién va dirigido ───────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          ¿A quién le sirve una evaluación postural clínica?
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">👧</p>
            <h3 className="font-semibold text-slate-900 mb-2">Niños y adolescentes</h3>
            <p className="text-sm text-slate-600">
              Dificultades de atención, hiperactividad, torpeza motora, mala
              postura, retraso del desarrollo psicomotor, o diagnósticos como
              TDAH o espectro autista donde los captores sensoriales no han
              sido evaluados.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">🏃</p>
            <h3 className="font-semibold text-slate-900 mb-2">Deportistas</h3>
            <p className="text-sm text-slate-600">
              Coordinación ojo-mano deficiente, reclutamiento muscular
              ineficiente, lesiones recurrentes asociadas a desbalances
              posturales, o quienes buscan optimizar su rendimiento desde
              la base neurológica.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">🧑‍💼</p>
            <h3 className="font-semibold text-slate-900 mb-2">Adultos con dolor postural crónico</h3>
            <p className="text-sm text-slate-600">
              Dolor cervical, lumbar o de cabeza asociado a alteraciones
              posturales que no responden a terapias convencionales.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">👁️</p>
            <h3 className="font-semibold text-slate-900 mb-2">Problemas visuales o de equilibrio</h3>
            <p className="text-sm text-slate-600">
              Mareos, inestabilidad o fatiga visual que pueden tener un
              componente postural no diagnosticado.
            </p>
          </div>
        </div>
      </section>

      {/* ── Qué evaluamos ────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Qué evaluamos y cómo trabajamos
          </h2>
          <p className="text-slate-600 mb-8">
            La posturología clínica evalúa la información que el sistema
            nervioso central recibe de sus principales captores sensoriales
            y cómo esa información afecta la postura, el movimiento y el
            desarrollo. A partir de la evaluación, armamos un plan
            individualizado.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Captor ocular</p>
                <p className="text-sm text-slate-600">
                  Cómo los ojos guían la postura y el movimiento. Alteraciones
                  oculomotoras pueden afectar lectura, coordinación y equilibrio.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Captor podal</p>
                <p className="text-sm text-slate-600">
                  El pie como receptor sensorial: cómo la información del apoyo
                  plantar influye en el tono muscular y la postura global.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Sistema musculoesquelético</p>
                <p className="text-sm text-slate-600">
                  Cadenas musculares, asimetrías y restricciones que modifican
                  la respuesta postural del sistema nervioso central.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Respuesta del SNC</p>
                <p className="text-sm text-slate-600">
                  Cómo el sistema nervioso central integra toda esta información
                  y produce la postura, el tono y el movimiento que observamos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Resultados ───────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Qué resultados se observan
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
            <p className="font-semibold text-teal-900 text-sm">Alteraciones sensoriales y posturales</p>
            <p className="text-xs text-teal-700 mt-1">
              Cambios visibles en la organización postural tras intervenir
              los captores alterados.
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
            <p className="font-semibold text-teal-900 text-sm">TDAH, espectro autista y desarrollo psicomotor</p>
            <p className="text-xs text-teal-700 mt-1">
              Mejoría en síntomas cuando el componente sensorial-postural
              es parte del problema.
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
            <p className="font-semibold text-teal-900 text-sm">Rendimiento deportivo</p>
            <p className="text-xs text-teal-700 mt-1">
              Planes individualizados para coordinación ojo-mano, reclutamiento
              muscular y eficiencia energética.
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
            <p className="font-semibold text-teal-900 text-sm">Análisis caso a caso</p>
            <p className="text-xs text-teal-700 mt-1">
              Cada plan se diseña según la evaluación del paciente y sus
              necesidades específicas.
            </p>
          </div>
        </div>
      </section>

      {/* ── Credenciales ─────────────────────────────────── */}
      <section className="border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
              <p className="text-sm font-bold text-slate-900">Kinesiólogo D.O.</p>
              <p className="text-xs text-slate-600 mt-1">
                Formación internacional en osteopatía
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
              <p className="text-sm font-bold text-slate-900">Posturólogo clínico</p>
              <p className="text-xs text-slate-600 mt-1">
                Evaluación de captores sensoriales y SNC
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
              <p className="text-sm font-bold text-slate-900">Docente EOM Internacional</p>
              <p className="text-xs text-slate-600 mt-1">
                Escuela de Osteopatía de Madrid — faculty
              </p>
            </div>
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
              <CampaignLeadForm servicio="posturologia" />
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
