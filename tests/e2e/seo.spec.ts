import { expect, test, type Page } from "@playwright/test";
import { services, siteConfig } from "../../lib/site-config";
import { conditions } from "../../lib/condiciones";

// SEO de cada página pública. Etiqueta @prod: son de solo lectura y se
// pueden correr también contra el sitio publicado (ver playwright.config.ts).

const pages: { path: string; title: RegExp }[] = [
  { path: "/", title: /Vuelve a tu deporte sin dolor en Viña del Mar \| Sakros/ },
  { path: "/servicios", title: /Servicios de osteopatía, kinesiología y posturología en Viña del Mar/ },
  ...services.map((s) => ({
    path: `/servicios/${s.slug}`,
    title: new RegExp(`${s.name} en Viña del Mar \\| Sakros`),
  })),
  ...conditions.map((c) => ({
    path: `/kinesiologia/${c.slug}`,
    title: new RegExp(`${c.metaTitle} \\| Sakros`),
  })),
  { path: "/quienes-somos", title: /Quiénes Somos/ },
  { path: "/evidencia-metodologia", title: /Evidencia y Metodología/ },
  { path: "/packs-tratamiento", title: /Packs de Tratamiento/ },
  { path: "/reserva", title: /Reserva tu hora/ },
  { path: "/contacto", title: /Contacto y ubicación en Viña del Mar/ },
  { path: "/blog", title: /Blog/ },
];

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.flatMap((r) => {
    const parsed = JSON.parse(r);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

const canonicalFor = (path: string) => (path === "/" ? siteConfig.url : `${siteConfig.url}${path}`);

for (const { path, title } of pages) {
  test.describe(`${path} @prod`, () => {
    test("título, descripción, canonical y H1", async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);

      await expect(page).toHaveTitle(title);
      expect((await page.title()).length).toBeLessThanOrEqual(80);

      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThanOrEqual(50);
      expect(description?.length ?? 0).toBeLessThanOrEqual(200);

      // Cada página es su propia versión oficial (no el home).
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonicalFor(path));
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonicalFor(path));

      await expect(page.locator("html")).toHaveAttribute("lang", "es-CL");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    });

    test("imágenes con texto alternativo", async ({ page }) => {
      await page.goto(path);
      const missingAlt = await page.locator("img:not([alt]), img[alt='']").count();
      expect(missingAlt).toBe(0);
    });
  });
}

test.describe("datos estructurados @prod", () => {
  test("el negocio local está completo en todas las páginas", async ({ page }) => {
    await page.goto("/");
    const business = (await jsonLd(page)).find((d) => d["@type"] === "MedicalBusiness");
    expect(business).toBeTruthy();
    expect(business).toMatchObject({
      name: siteConfig.name,
      telephone: siteConfig.phone,
      address: { addressLocality: "Viña del Mar", streetAddress: siteConfig.address.street },
    });
    expect(business?.openingHoursSpecification).toBeTruthy();
    expect(JSON.stringify(business?.areaServed)).toContain("Viña del Mar");
  });

  test("el home marca sus preguntas frecuentes", async ({ page }) => {
    await page.goto("/");
    const types = (await jsonLd(page)).map((d) => d["@type"]);
    expect(types).toContain("FAQPage");
  });

  for (const s of services) {
    test(`/servicios/${s.slug} tiene terapia, migas y FAQ`, async ({ page }) => {
      await page.goto(`/servicios/${s.slug}`);
      const data = await jsonLd(page);
      const types = data.map((d) => d["@type"]);
      expect(types).toEqual(expect.arrayContaining(["MedicalTherapy", "BreadcrumbList", "FAQPage"]));
      const faq = data.find((d) => d["@type"] === "FAQPage") as { mainEntity: unknown[] };
      expect(faq.mainEntity.length).toBe(s.faqs.length);
      await expect(page.getByRole("heading", { name: "¿Para quién es este servicio?" })).toBeVisible();
    });
  }
});

test.describe("páginas por molestia @prod", () => {
  for (const c of conditions) {
    test(`/kinesiologia/${c.slug}: datos estructurados, señales de alerta y reserva`, async ({ page }) => {
      await page.goto(`/kinesiologia/${c.slug}`);
      const types = (await jsonLd(page)).map((d) => d["@type"]);
      expect(types).toEqual(expect.arrayContaining(["MedicalWebPage", "BreadcrumbList", "FAQPage"]));
      await expect(page.getByRole("heading", { name: "Cuándo consultar primero a un médico" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Reserva tu evaluación" })).toHaveAttribute(
        "href",
        `/reserva?servicio=${c.service}`
      );
    });
  }

  test("la página de kinesiología enlaza a cada molestia", async ({ page }) => {
    await page.goto("/servicios/kinesiologia");
    await expect(page.getByRole("heading", { name: "Molestias que tratamos" })).toBeVisible();
    for (const c of conditions) {
      await expect(page.locator(`a[href="/kinesiologia/${c.slug}"]`).first()).toBeVisible();
    }
  });
});

test.describe("kinesiología en Viña del Mar @prod", () => {
  test("la página apunta a la búsqueda local y lleva a reservar", async ({ page }) => {
    await page.goto("/servicios/kinesiologia");
    await expect(page).toHaveTitle(/^Kinesiología en Viña del Mar \| Sakros$/);
    await expect(page.locator("h1")).toHaveText("Kinesiología");
    const body = (await page.locator("main").innerText()).toLowerCase();
    expect(body).toContain("rehabilitación");
    await expect(page.getByRole("link", { name: "Reserva una evaluación" })).toHaveAttribute(
      "href",
      "/reserva?servicio=kinesiologia"
    );
  });
});
