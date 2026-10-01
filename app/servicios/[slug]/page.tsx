import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { paymentLinks, servicePacks, services, siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, businessId, pageMetadata } from "@/lib/seo";

// Imágenes específicas por servicio (solo los que tienen fotos propias)
const serviceImages: Record<string, { src: string; alt: string }[]> = {
  "estudio-biomecanico-pie": [
    { src: "/images/baropodometria.png", alt: "Análisis baropodométrico — mapa de presiones plantares" },
    { src: "/images/plataforma-presiones-scanner3d.png", alt: "Plataforma de presiones y escáner 3D" },
    { src: "/images/scanner-2d.png", alt: "Escáner 2D para diseño de plantillas personalizadas" },
  ],
  "plantillas-ortopedicas": [
    { src: "/images/plantillas-pie.jpg", alt: "Prueba de plantilla ortopédica personalizada" },
    { src: "/images/plantillas-mano.jpg", alt: "Plantilla Motion & Balance terminada" },
    { src: "/images/plantillas-kit.jpg", alt: "Kit Motion & Balance — estudio biomecánico y plantillas" },
    { src: "/images/motion-balance-tecnologia.png", alt: "Tecnología de fresado CNC para plantillas ortopédicas a medida" },
  ],
};

// Videos por servicio
const serviceVideos: Record<string, { src: string; alt: string }[]> = {
  "estudio-biomecanico-pie": [
    { src: "/images/evaluacion-pie.mp4", alt: "Evaluación biomecánica del pie en Sakros" },
    { src: "/images/biomecanico-sensor.mp4", alt: "Paciente en plataforma Sensor Medica" },
  ],
  "posturologia": [
    { src: "/images/posturologia.mp4", alt: "Evaluación postural en Sakros" },
  ],
  "kinesiologia": [
    { src: "/images/kine-puente.mp4", alt: "Ejercicio de rehabilitación supervisado" },
    { src: "/images/kine-plancha.mp4", alt: "Ejercicio de control motor" },
    { src: "/images/kine-cuadrupedia.mp4", alt: "Ejercicio progresivo en la clínica" },
  ],
  "actividad-fisica-dirigida": [
    { src: "/images/af-adulta-mayor.mp4", alt: "Actividad física dirigida en Sakros" },
  ],
  "plantillas-ortopedicas": [
    { src: "/images/plantillas-video.mp4", alt: "Proceso de fabricación de plantillas Motion & Balance" },
  ],
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata({
    title: `${service.name} en Viña del Mar`,
    description: service.description,
    path: `/servicios/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalTherapy",
    name: service.name,
    description: service.description,
    url: `${siteConfig.url}/servicios/${service.slug}`,
    image: `${siteConfig.url}${service.image}`,
    provider: { "@id": businessId },
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Servicios", path: "/servicios" },
    { name: service.name, path: `/servicios/${service.slug}` },
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbs, faqJsonLd]) }}
      />
      <Image
        src={service.image}
        alt={service.name}
        width={1200}
        height={700}
        className="w-full rounded-2xl mb-8 object-cover max-h-[300px]"
        priority
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 mb-3">
        {service.tagline}
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{service.name}</h1>
      <p className="text-slate-600 mb-8">{service.description}</p>
      <ul className="space-y-3 mb-10">
        {service.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3 text-slate-700">
            <span className="text-teal-700">→</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <section className="mb-10 rounded-2xl bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          ¿Para quién es este servicio?
        </h2>
        <ul className="space-y-2">
          {service.forWho.map((item) => (
            <li key={item} className="flex gap-3 text-slate-700">
              <span className="text-teal-700">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      {serviceVideos[service.slug] && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {serviceVideos[service.slug].map((vid) => (
            <video
              key={vid.src}
              src={vid.src}
              autoPlay
              loop
              muted
              playsInline
              className="rounded-xl w-full max-h-[250px] object-cover"
            >
              {vid.alt}
            </video>
          ))}
        </div>
      )}
      {serviceImages[service.slug] && (
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {serviceImages[service.slug].map((img) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={600}
              height={400}
              className="rounded-xl object-cover w-full"
            />
          ))}
        </div>
      )}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Preguntas frecuentes: {service.shortName}
        </h2>
        <div className="space-y-6">
          {service.faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
      {(servicePacks[service.slug] || paymentLinks[service.slug]) && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Opciones y valores</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {paymentLinks[service.slug] && (
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="font-semibold text-slate-900">Sesión individual</p>
                <p className="text-sm text-slate-600 mt-1 mb-4">
                  Reserva tu hora y paga online al agendar o en la clínica.
                </p>
                <Link
                  href={`/reserva?servicio=${service.slug}`}
                  className="inline-block rounded-full border border-teal-700 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  Reservar sesión
                </Link>
              </div>
            )}
            {servicePacks[service.slug] && (() => {
              const pack = servicePacks[service.slug];
              const href =
                pack.paymentUrl ??
                `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                  `Hola, me interesa el ${pack.name}.`
                )}`;
              return (
                <div className="rounded-2xl border-2 border-teal-700 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Programa</p>
                  <p className="font-semibold text-slate-900">{pack.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pack.price}</p>
                  <p className="text-sm text-slate-600 mt-1">{pack.includes}</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">{pack.validity}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    {pack.paymentUrl ? "Comprar programa" : "Consultar por WhatsApp"}
                  </a>
                </div>
              );
            })()}
          </div>
        </section>
      )}
      <div className="flex flex-wrap gap-4">
        <Link
          href={`/reserva?servicio=${service.slug}`}
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reserva una evaluación
        </Link>
        <Link
          href="/servicios"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-700"
        >
          Ver todos los servicios
        </Link>
      </div>
    </div>
  );
}
