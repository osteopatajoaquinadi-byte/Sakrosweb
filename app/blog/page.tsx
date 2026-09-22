import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos sobre vuelta al deporte, dolor recurrente y recuperación funcional, desde Sakros en Viña del Mar.",
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Blog</h1>
      <div className="space-y-10">
        {blogPosts.map((post) => (
          <article key={post.slug} className="border-b border-slate-200 pb-8">
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-xl font-semibold text-slate-900 hover:text-teal-700 mb-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-sm text-slate-500 mb-3">
              {new Date(post.date).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-slate-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
