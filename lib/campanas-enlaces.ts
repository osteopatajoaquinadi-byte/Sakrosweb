import { blogPosts } from "@/lib/blog-posts";
import { services, siteConfig } from "@/lib/site-config";

/** Páginas del sitio que la IA puede usar como botón de la campaña. */
export function enlacesSitio() {
  return [
    { url: `${siteConfig.url}/reserva`, titulo: "Reservar hora online" },
    { url: `${siteConfig.url}/packs-tratamiento`, titulo: "Packs de tratamiento" },
    ...services.map((s) => ({ url: `${siteConfig.url}/servicios/${s.slug}`, titulo: s.name })),
    ...blogPosts.map((b) => ({ url: `${siteConfig.url}/blog/${b.slug}`, titulo: `Blog: ${b.title}` })),
  ];
}
