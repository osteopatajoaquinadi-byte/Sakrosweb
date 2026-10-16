import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import CampaignLeadForm from "@/components/CampaignLeadForm";

export const metadata: Metadata = {
  title: "Evaluación de Osteopatía en Viña del Mar | Sakros",
  description:
    "¿Dolor persistente, cefaleas o problemas digestivos que no mejoran? Agenda tu evaluación con un kinesiólogo especializado en osteopatía y PNI clínica en Viña del Mar.",
  robots: { index: false, follow: false }, // No indexar — tráfico solo desde ads
};

export default function OsteopatiaLandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-teal-900 to-teal-800 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 text-center">
          <p className="text-teal-300 text-sm font-semibold uppercase tracking-wide mb-4">
            Osteopatía + PNI Clínica en Viña del Mar
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
            ¿Dolor que va y viene hace meses y nadie te da una respuesta clara?
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8">
            No es que no tenga solución. Es que probablemente nadie ha evaluado
            tu caso de forma integral. Detrás del dolor persistente suele haber
            un sistema nervioso desregulado, no solo un músculo contracturado.
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
          Si alguno de estos te suena, no estás solo
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">🔄</p>
            <h3 className="font-semibold text-slate-900 mb-2">Llevas meses con lo mismo</h3>
            <p className="text-sm text-slate-600">
              Dolor de espalda, cefaleas, mala digestión o problemas para dormir
              que aparecen, se van y vuelven. Ya es parte de tu rutina.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">💊</p>
            <h3 className="font-semibold text-slate-900 mb-2">Ya probaste de todo</h3>
            <p className="text-sm text-slate-600">
              Antiinflamatorios, masajes, kinesiología convencional. Algo mejora
              por unos días, pero el problema de fondo sigue ahí.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-2xl mb-3">🤷</p>
            <h3 className="font-semibold text-slate-900 mb-2">Te dicen que no es nada</h3>
            <p className="text-sm text-slate-600">
              Los exámenes salen normales, pero tú sabes que algo no está bien.
              Nadie ha mirado el cuadro completo.
            </p>
          </div>
        </div>
      </section>

      {/* ── Lo que hacemos diferente ─────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Un enfoque que mira el sistema completo, no solo la zona que duele
          </h2>
          <p className="text-slate-600 mb-8">
            Como kinesiólogo especializado en osteopatía y psiconeuroinmunología
            clínica, evalúo cómo interactúan tu sistema nervioso, tu aparato
            digestivo y tu aparato musculoesquelético. Muchas veces el dolor
            crónico no es un problema mecánico — es un sistema nervioso autónomo
            que quedó en modo alerta.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Evaluación integral</p>
                <p className="text-sm text-slate-600">
                  No solo dónde duele, sino por qué duele. Historia clínica,
                  evaluación manual, patrones de movimiento y hábitos.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Terapia manual avanzada</p>
                <p className="text-sm text-slate-600">
                  Osteopatía, movilización neural y técnicas miofasciales para
                  modular la respuesta de dolor desde la primera sesión.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Movimiento y hábitos</p>
                <p className="text-sm text-slate-600">
                  Un plan que combina ejercicio progresivo y cambios en tus
                  hábitos para que el resultado sea sostenible, no temporal.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-teal-700 font-bold text-lg mt-0.5">→</span>
              <div>
                <p className="font-semibold text-slate-900">Regulación del sistema nervioso</p>
                <p className="text-sm text-slate-600">
                  Trabajo específico sobre el eje intestino-cerebro, la
                  variabilidad cardíaca (HRV) y los patrones de sueño.
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
            <p className="text-sm font-bold text-teal-900">Kinesiólogo D.O.</p>
            <p className="text-xs text-teal-700 mt-1">
              Diplomado en Osteopatía — formación internacional
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 text-center">
            <p className="text-sm font-bold text-teal-900">MSc PNI Clínica</p>
            <p className="text-xs text-teal-700 mt-1">
              Máster en Psiconeuroinmunología Clínica
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 text-center">
            <p className="text-sm font-bold text-teal-900">Docente EOM Internacional</p>
            <p className="text-xs text-teal-700 mt-1">
              Escuela de Osteopatía de Madrid — faculty
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
              <CampaignLeadForm servicio="osteopatia" />
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
