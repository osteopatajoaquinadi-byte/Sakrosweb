import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { conditions } from "@/lib/condiciones";
import { servicePacks, services, sessionPrices, siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, businessId, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return conditions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = conditions.find((x) => x.slug === slug);
  if (!c) return {};
  return pageMetadata({ title: c.metaTitle, description: c.description, path: `/kinesiologia/${c.slug}` });
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-slate-700">
          <span className="text-teal-700">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = conditions.find((x) => x.slug === slug);
  if (!c) notFound();

  const service = services.find((s) => s.slug === c.service)!;
  const pack = servicePacks[c.service];
  const path = `/kinesiologia/${c.slug}`;
  const others = conditions.filter((x) => x.service === c.service && x.slug !== c.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: c.h1,
      description: c.description,
      url: `${siteConfig.url}${path}`,
      inLanguage: "es-CL",
      about: { "@type": "MedicalCondition", name: c.shortName },
      provider: { "@id": businessId },
    },
    breadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: service.name, path: `/servicios/${service.slug}` },
      { name: c.shortName, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Ruta" className="text-sm text-slate-500 mb-6">
        <Link href="/servicios" className="hover:text-teal-700">Servicios</Link>
        {" / "}
        <Link href={`/servicios/${service.slug}`} className="hover:text-teal-700">{service.name}</Link>
        {" / "}
        <span className="text-slate-700">{c.shortName}</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-6">{c.h1}</h1>
      {c.intro.map((p) => (
        <p key={p} className="text-slate-600 mb-4">{p}</p>
      ))}

      <div className="flex flex-wrap gap-3 my-8">
        <Link
          href={`/reserva?servicio=${service.slug}`}
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reserva tu evaluación
        </Link>
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hola, quiero consultar por ${c.shortName.toLowerCase()}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-700"
        >
          Escríbenos por WhatsApp
        </a>
      </div>

      <section className="mb-10 rounded-2xl bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">¿Cuándo consultar?</h2>
        <List items={c.whenToConsult} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Cómo lo evaluamos</h2>
        <List items={c.evaluation} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Cómo es el tratamiento</h2>
        <List items={c.treatment} />
        <p className="text-sm text-slate-500 mt-4">
          El número de sesiones depende de tu caso: te proponemos un plan en la primera evaluación y lo
          ajustamos según cómo respondes. Conoce en qué nos basamos en{" "}
          <Link href="/evidencia-metodologia" className="underline hover:text-teal-700">Evidencia y Metodología</Link>.
        </p>
      </section>

      <section className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cuándo consultar primero a un médico</h2>
        <p className="text-sm text-slate-700 mb-4">
          Si tienes alguna de estas señales, consulta en un servicio de urgencia o con tu médico antes de
          iniciar kinesiología:
        </p>
        <List items={c.redFlags} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Valores</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="font-semibold text-slate-900">Sesión de {service.shortName.toLowerCase()}</p>
            {sessionPrices[service.slug] && (
              <p className="text-2xl font-bold text-slate-900 mt-1">{sessionPrices[service.slug]}</p>
            )}
            <p className="text-sm text-slate-600 mt-1 mb-4">Reserva online y paga en la clínica.</p>
            <Link
              href={`/reserva?servicio=${service.slug}`}
              className="inline-block rounded-full border border-teal-700 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
            >
              Reservar sesión
            </Link>
          </div>
          {pack && (
            <div className="rounded-2xl border-2 border-teal-700 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Programa</p>
              <p className="font-semibold text-slate-900">{pack.name}</p>
              <p className="text-sm text-slate-600 mt-1">{pack.includes}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {(pack.options ?? []).map((o) => (
                  <a
                    key={o.label}
                    href={o.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    {o.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Preguntas frecuentes</h2>
        <div className="space-y-6">
          {c.faqs.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-slate-900 mb-2">{f.q}</h3>
              <p className="text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">También tratamos</h2>
        <div className="flex flex-wrap gap-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/kinesiologia/${o.slug}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:border-teal-700 hover:text-teal-700"
            >
              {o.shortName}
            </Link>
          ))}
          <Link
            href={`/servicios/${service.slug}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:border-teal-700 hover:text-teal-700"
          >
            {service.name} en Viña del Mar
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-6">
          {siteConfig.address.street}, {siteConfig.address.city}.{" "}
          {siteConfig.openingHours.map((h) => `${h.label} ${h.opens}–${h.closes}`).join(" · ")}.
        </p>
      </section>
    </div>
  );
}
