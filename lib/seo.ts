import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Metadata por página: canonical propio + Open Graph/Twitter con el título
// y la URL de esa página. Sin esto, cada página hereda el canonical "/" y
// el Open Graph del home desde el layout (Google las trataría como
// duplicados del home y al compartirlas en redes se vería el home).
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  // El template "%s | Sakros" del layout no se aplica al home (mismo
  // segmento que el layout), así que ahí se agrega la marca a mano.
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  return {
    title: absoluteTitle ? { absolute: fullTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: path,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

// Identificador estable del negocio en JSON-LD, para que el resto de las
// páginas lo referencien en vez de redeclararlo.
export const businessId = `${siteConfig.url}/#business`;

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
