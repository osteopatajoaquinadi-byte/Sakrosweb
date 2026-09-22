import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services, siteConfig } from "@/lib/site-config";

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
  return {
    title: service.name,
    description: service.description,
  };
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
    provider: {
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
      <div className="flex flex-wrap gap-4">
        <a
          href={siteConfig.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reserva una evaluación
        </a>
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
