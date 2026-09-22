import type { MetadataRoute } from "next";
import { services, siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/lib/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/servicios",
    "/quienes-somos",
    "/evidencia-metodologia",
    "/packs-tratamiento",
    "/reserva",
    "/contacto",
    "/blog",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${siteConfig.url}/servicios/${service.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = blogPosts
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
