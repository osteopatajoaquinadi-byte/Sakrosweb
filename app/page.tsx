import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { services, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Vuelve a tu deporte sin dolor en Viña del Mar",
  description:
    "Osteopatía, kinesiología y posturología a tu medida en Viña del Mar. Evaluamos el origen del dolor para que vuelvas a entrenar con confianza, no solo para que dejes de sentirlo.",
};

const faqs = [
  {
    q: "¿Puedo volver a entrenar si el dolor sigue apareciendo cada cierto tiempo?",
    a: "En la mayoría de los casos sí, pero primero hay que identificar por qué reaparece. Un dolor que va y viene suele indicar una compensación o una sobrecarga no resuelta, no que 'el cuerpo ya no da para más'. Por eso partimos con una evaluación biomecánica antes de armar el plan de vuelta al deporte.",
  },
  {
    q: "Dejé de doler, pero no me atrevo a volver a entrenar como antes ¿es normal?",
    a: "Sí, es una de las consultas más frecuentes que vemos. Entre 'ya no duele' y 'ya puedo entrenar como antes' hay una etapa de readaptación de carga que la rehabilitación tradicional muchas veces no cubre. Nuestro servicio de actividad física dirigida existe justo para ese puente.",
  },
  {
    q: "¿Necesito tener una lesión reciente para venir, o sirve si fue hace años?",
    a: "No es necesario que sea reciente. Vemos harto ex-deportista con una lesión antigua mal resuelta que sigue condicionando cómo se mueve hoy, aunque ya no le 'duela' todos los días.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 mb-4">
              Osteopatía · Kinesiología · Posturología en Viña del Mar
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Vuelve a tu deporte sin dolor
            </h1>
            <p className="text-lg text-slate-600 mb-4">
              En Sakros ayudamos a ex-deportistas y deportistas activos a volver a
              entrenar con confianza, con una evaluación individualizada que busca el
              origen del dolor, no solo calmarlo.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              {siteConfig.address.street} · {siteConfig.address.city},{" "}
              {siteConfig.address.region}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/reserva"
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Reserva tu evaluación
              </Link>
              <Link
                href="/evidencia-metodologia"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-700"
              >
                Cómo trabajamos
              </Link>
            </div>
          </div>
          <div>
            <Image
              src="/images/joaquin-adi.jpg"
              alt="Joaquín Adi — Osteópata y Kinesiólogo, director de Sakros"
              width={600}
              height={800}
              className="rounded-2xl object-cover w-full max-h-[500px]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Credenciales */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 sm:grid-cols-3 text-center text-sm text-slate-600">
          <div>
            <p className="text-2xl font-bold text-slate-900">D.O.</p>
            <p>Osteopatía, formación internacional</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">MSc PNIc</p>
            <p>Psiconeuroinmunología clínica</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">EOM Internacional</p>
            <p>Faculty internacional en osteopatía</p>
          </div>
        </div>
      </section>

      {/* Áreas de tratamiento */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Nuestras áreas de tratamiento
        </h2>
        <p className="text-slate-600 mb-10 max-w-2xl">
          Cada área se apoya en las demás cuando el caso lo requiere — el objetivo no
          es una sesión aislada, es un plan.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/servicios/${service.slug}`}
              className="block rounded-2xl border border-slate-200 overflow-hidden hover:border-teal-700 hover:shadow-sm transition"
            >
              <Image
                src={service.image}
                alt={service.shortName}
                width={1200}
                height={700}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 mb-1">{service.shortName}</h3>
                <p className="text-sm text-slate-600">{service.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Por qué a tu medida */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            ¿Por qué &quot;a tu medida&quot;?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <p className="text-slate-600">
              Cada tratamiento parte por una evaluación individualizada: buscamos el
              origen del problema, no solo el síntoma. Evaluamos biomecánica articular,
              integración del sistema nervioso central, hábitos diarios y movimiento,
              para que el plan se ajuste a tu cuerpo y a tu objetivo real — volver a
              moverte como antes.
            </p>
            <video
              src="/images/hrv-kettlebell.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl w-full max-h-[240px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonio */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Lo que dicen nuestros pacientes
        </h2>
        <div className="max-w-xs">
          <video
            src="/images/testimonio-paciente.mp4"
            controls
            playsInline
            preload="metadata"
            className="rounded-2xl w-full"
          >
            Testimonio de Sebastián Delgadillo
          </video>
          <div className="mt-3">
            <p className="font-semibold text-slate-900">Sebastián Delgadillo</p>
            <p className="text-sm text-slate-500">Condromalacia grado 4</p>
          </div>
        </div>
      </section>

      {/* FAQ orientadas a búsqueda real */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Preguntas frecuentes</h2>
        <div className="space-y-8 max-w-3xl">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Dónde estamos */}
      <section className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Dónde estamos</h2>
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div>
              <p className="text-slate-600 mb-4">
                {siteConfig.address.street}
                <br />
                {siteConfig.address.city}, {siteConfig.address.region}
              </p>
              <Link
                href="/reserva"
                className="inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Reserva tu evaluación
              </Link>
            </div>
            <video
              src="/images/clinica-recorrido.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl object-cover w-full max-h-[280px]"
            >
              Recorrido por Clínica Sakros en Viña del Mar
            </video>
          </div>
        </div>
      </section>
    </div>
  );
}
