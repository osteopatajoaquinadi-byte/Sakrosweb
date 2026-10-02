import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { siteConfig, services } from "@/lib/site-config";
import MobileNav from "@/components/MobileNav";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { businessId } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  // Meta de verificación de Search Console (NEXT_PUBLIC_GSC_VERIFICATION en Vercel).
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

const navLinks = [
  { href: "/servicios", label: "Servicios" },
  { href: "/reserva", label: "Reserva" },
  { href: "/evidencia-metodologia", label: "Evidencia y Metodología" },
  { href: "/quienes-somos", label: "Quiénes Somos" },
  { href: "/blog", label: "Blog" },
  { href: "/packs-tratamiento", label: "Packs" },
  { href: "/contacto", label: "Contacto" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": businessId,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo-sakros.png`,
    image: `${siteConfig.url}/og-image.jpg`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${siteConfig.address.street}, ${siteConfig.address.city}, Chile`
    )}`,
    openingHoursSpecification: siteConfig.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: [
      { "@type": "City", name: "Viña del Mar" },
      { "@type": "City", name: "Valparaíso" },
      { "@type": "City", name: "Concón" },
      { "@type": "City", name: "Quilpué" },
    ],
    medicalSpecialty: ["PhysicalTherapy", "Musculoskeletal"],
    availableService: services.map((service) => ({
      "@type": "MedicalTherapy",
      name: service.name,
      url: `${siteConfig.url}/servicios/${service.slug}`,
    })),
    sameAs: [siteConfig.instagram],
  };

  return (
    <html lang="es-CL" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-slate-900 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo-sakros.png"
                alt="Sakros"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-teal-700">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/equipo"
                className="hidden md:inline-block rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                Acceso Profesional
              </Link>
              <Link
                href="/reserva"
                className="hidden md:inline-block rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Reserva
              </Link>
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-2">Sakros</p>
              <p>{siteConfig.address.street}</p>
              <p>
                {siteConfig.address.city}, {siteConfig.address.region}
              </p>
              {siteConfig.openingHours.map((h) => (
                <p key={h.label} className="mt-2 first-of-type:mt-3">
                  {h.label}: {h.opens} – {h.closes}
                </p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">Contacto</p>
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
              <p>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-700"
                >
                  @sakros_salud
                </a>
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">Navegación</p>
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-teal-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 space-y-2">
              <p>
                Aviso: la información de este sitio es educativa y no reemplaza una
                evaluación clínica presencial. No constituye diagnóstico ni tratamiento a
                distancia. Ante dolor agudo, una lesión reciente o dudas sobre tu salud,
                consulta directamente con nuestro equipo o con un profesional de salud.
              </p>
              <p>
                © {new Date().getFullYear()} Sakros — {siteConfig.legalName}. Todos los
                derechos reservados.
              </p>
            </div>
          </div>
        </footer>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
