import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/site-config";
import ServiceCardHeader from "@/components/ServiceCardHeader";

export const metadata: Metadata = pageMetadata({
  title: "Servicios de osteopatía, kinesiología y posturología en Viña del Mar",
  description:
    "Osteopatía, kinesiología, posturología, plantillas ortopédicas y actividad física dirigida en Viña del Mar.",
  path: "/servicios",
});

export default function ServiciosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Servicios</h1>
      <p className="text-slate-600 max-w-2xl mb-10">
        Trabajamos de forma individualizada. Estas son las áreas que combinamos según
        lo que tu evaluación muestre que necesitas.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={`/servicios/${service.slug}`}
            className="block rounded-2xl border border-slate-200 overflow-hidden hover:border-teal-700 hover:shadow-sm transition"
          >
            <ServiceCardHeader
              slug={service.slug}
              name={service.name}
              tagline={service.tagline}
            />
            <div className="p-5">
              <h2 className="font-semibold text-slate-900 mb-1">{service.name}</h2>
              <p className="text-sm text-slate-600">{service.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
