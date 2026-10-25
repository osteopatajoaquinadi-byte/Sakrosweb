import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd, businessId, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  // Los borradores no se indexan hasta que tengan revisión clínica.
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    noindex: post.draft,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: "es-CL",
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: "Joaquín Adi",
      url: `${siteConfig.url}/quienes-somos`,
    },
    publisher: { "@id": businessId },
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbs]) }}
      />
      {post.draft && (
        <p className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          Borrador de estructura — pendiente de revisión clínica de Juaco antes de
          publicar.
        </p>
      )}
      <p className="text-sm text-slate-500 mb-3">
        {new Date(post.date).toLocaleDateString("es-CL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{post.title}</h1>
      <div className="space-y-4 text-slate-700">
        {post.body.map((paragraph, i) => {
          if (paragraph.startsWith("## ")) {
            return (
              <h2 key={i} className="text-xl font-semibold text-slate-900 pt-6">
                {paragraph.slice(3)}
              </h2>
            );
          }
          if (paragraph === "[[video]]") {
            if (!post.video) return null;
            return (
              <figure key={i} className="my-8 max-w-[300px]">
                <video
                  src={post.video.src}
                  poster={post.video.poster}
                  controls
                  playsInline
                  preload="metadata"
                  className="rounded-2xl w-full"
                >
                  Testimonio de {post.video.nombre}
                </video>
                <figcaption className="mt-3">
                  <span className="block font-semibold text-slate-900">{post.video.nombre}</span>
                  <span className="text-sm text-slate-500">{post.video.detalle}</span>
                </figcaption>
              </figure>
            );
          }
          return <p key={i}>{paragraph}</p>;
        })}
      </div>

      {post.referencias && post.referencias.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Referencias</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
            {post.referencias.map((r) => (
              <li key={r.doi}>
                {r.texto}{" "}
                <a
                  href={`https://doi.org/${r.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 hover:underline break-all"
                >
                  doi:{r.doi}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-slate-200">
        <a
          href="/reserva"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reserva una evaluación
        </a>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            También te puede interesar
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="text-teal-700 hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
