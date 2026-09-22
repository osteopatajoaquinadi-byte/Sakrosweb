import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
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
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
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
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
              Sakros
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-teal-700">
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/reserva"
              className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Reserva
            </Link>
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
      </body>
    </html>
  );
}
