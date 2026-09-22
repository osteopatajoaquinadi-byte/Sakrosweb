import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Escríbenos o agenda tu evaluación en ${siteConfig.address.street}, ${siteConfig.address.city}.`,
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 grid gap-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Contacto</h1>
        <div className="space-y-3 text-slate-600 mb-8">
          <p>{siteConfig.address.street}</p>
          <p>
            {siteConfig.address.city}, {siteConfig.address.region}
          </p>
          <p>
            <a href={`tel:${siteConfig.phone}`} className="hover:text-teal-700">
              {siteConfig.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${siteConfig.email}`} className="hover:text-teal-700">
              {siteConfig.email}
            </a>
          </p>
        </div>
        <a
          href={siteConfig.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
      <div>
        <ContactForm />
      </div>
    </div>
  );
}
