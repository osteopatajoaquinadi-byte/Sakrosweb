import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { siteConfig } from "@/lib/site-config";

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
  return {
    title: post.title,
    description: post.excerpt,
  };
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
    datePublished: post.date,
    author: { "@type": "Person", name: "Joaquín Adi" },
    publisher: { "@type": "MedicalBusiness", name: siteConfig.name },
  };

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

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
