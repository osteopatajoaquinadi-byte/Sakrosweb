import { expect, test } from "@playwright/test";
import { services, siteConfig } from "../../lib/site-config";
import { blogPosts } from "../../lib/blog-posts";

test.describe("rastreo e indexación @prod", () => {
  test("robots.txt bloquea API y panel y declara el sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain("Disallow: /equipo");
    expect(body).toContain(`Sitemap: ${siteConfig.url}/sitemap.xml`);
  });

  test("sitemap incluye servicios y excluye borradores y panel", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const s of services) expect(xml).toContain(`${siteConfig.url}/servicios/${s.slug}</loc>`);
    for (const p of blogPosts.filter((p) => p.draft)) expect(xml).not.toContain(`/blog/${p.slug}`);
    expect(xml).not.toContain("/equipo");
  });

  test("panel del equipo fuera de Google", async ({ page }) => {
    await page.goto("/equipo");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  for (const post of blogPosts.filter((p) => p.draft)) {
    test(`borrador /blog/${post.slug} no se indexa`, async ({ page }) => {
      await page.goto(`/blog/${post.slug}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  }
});

test.describe("redirecciones del Wix anterior @prod", () => {
  const redirects: [string, string][] = [
    ["/treatments", "/servicios"],
    ["/contact-8", "/contacto"],
    ["/plans-pricing", "/packs-tratamiento"],
    ["/laboratorio-plantillas", "/servicios/plantillas-ortopedicas"],
    ["/service-page/osteopat%C3%ADa", "/servicios/osteopatia"],
    ["/service-page/kinesiolog%C3%ADa-vi%C3%B1a-del-mar", "/servicios/kinesiologia"],
    ["/service-page/posturolog%C3%ADa-cl%C3%ADnica-1", "/servicios/posturologia"],
  ];
  for (const [from, to] of redirects) {
    test(`${decodeURIComponent(from)} → ${to} (301 o 308)`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect([301, 308]).toContain(res.status());
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe(to);
    });
  }
});

test.describe("enlaces internos @prod", () => {
  test("ningún enlace interno del home y servicios está roto", async ({ page, request }) => {
    const start = ["/", "/servicios", ...services.map((s) => `/servicios/${s.slug}`)];
    const links = new Set<string>();
    for (const path of start) {
      await page.goto(path);
      const hrefs = await page.locator("a[href^='/']").evaluateAll((as) =>
        as.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? "")
      );
      hrefs.filter((h) => !h.startsWith("/api/")).forEach((h) => links.add(h.split("#")[0]));
    }
    const broken: string[] = [];
    for (const href of links) {
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${href} → ${res.status()}`);
    }
    expect(broken).toEqual([]);
  });
});

test.describe("API protegidas", () => {
  // Sin sesión del panel, nada clínico ni de pagos responde.
  for (const path of ["/api/calendar?month=2026-10", "/api/fichas/patients", "/api/equipo/me"]) {
    test(`${path} exige sesión`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(401);
    });
  }

  test("el PIN antiguo por URL ya no sirve", async ({ request }) => {
    const res = await request.get("/api/calendar?month=2026-10&pin=Sakros2026");
    expect(res.status()).toBe(401);
  });

  test("no se puede registrar un pago sin sesión", async ({ request }) => {
    const res = await request.post("/api/fichas/payments", { data: { patient_id: "x", amount: 1 } });
    expect(res.status()).toBe(401);
  });
});
