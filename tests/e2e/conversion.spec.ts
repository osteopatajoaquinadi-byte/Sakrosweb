import { expect, test, type Page } from "@playwright/test";
import { paymentLinks, servicePacks, sessionPrices } from "../../lib/site-config";

// Flujo de reserva con las APIs simuladas: no toca Supabase ni crea reservas.
async function mockBookingApis(page: Page) {
  const posted: Record<string, unknown>[] = [];
  await page.route("**/api/week-availability**", async (route) => {
    const weekStart = new URL(route.request().url()).searchParams.get("weekStart")!;
    const available: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(`${weekStart}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + i);
      available[d.toISOString().slice(0, 10)] = 3;
    }
    await route.fulfill({ json: { available } });
  });
  await page.route("**/api/availability**", (route) => {
    const slug = new URL(route.request().url()).searchParams.get("service");
    return route.fulfill({
      json: {
        service: { id: "svc-1", name: slug, slug, duration_minutes: 60, price_clp: 40000 },
        slots: [{ time: "10:30", professional_id: "pro-1", professional_name: "Joaquín Adi A." }],
      },
    });
  });
  await page.route("**/api/bookings", async (route) => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ json: { booking: { id: "b-1" } } });
  });
  return posted;
}

async function bookUntilDetails(page: Page, servicio: string) {
  await page.goto(`/reserva?servicio=${servicio}`);
  // La semana actual puede no tener días futuros: se avanza una semana.
  await page.getByRole("button", { name: /Siguiente|→/ }).first().click();
  await page.locator("button:not([disabled])", { hasText: /3 hrs/ }).first().click();
  await page.getByRole("button", { name: /10:30/ }).click();
  await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
}

test("reserva de osteopatía con pago online muestra el link de Mercado Pago @mobile", async ({ page }) => {
  const posted = await mockBookingApis(page);
  await bookUntilDetails(page, "osteopatia");

  await page.getByLabel("Nombre completo *").fill("Paciente de Prueba");
  await page.getByLabel("Email *").fill("prueba@example.com");
  await page.getByRole("button", { name: /Pago online/ }).click();
  await page.getByRole("button", { name: "Confirmar reserva" }).click();

  await expect(page.getByText("Reserva confirmada")).toBeVisible();
  await expect(page.getByRole("link", { name: "Pagar ahora con Mercado Pago" })).toHaveAttribute(
    "href",
    paymentLinks.osteopatia
  );
  expect(posted[0]).toMatchObject({ payment_method: "online_webpay", client_name: "Paciente de Prueba" });
});

test("kinesiología no ofrece pago online mientras no tenga link", async ({ page }) => {
  await mockBookingApis(page);
  await bookUntilDetails(page, "kinesiologia");
  if (paymentLinks.kinesiologia) {
    await expect(page.getByRole("button", { name: /Pago online/ })).toBeVisible();
  } else {
    await expect(page.getByRole("button", { name: /Pago online/ })).toHaveCount(0);
  }
  await expect(page.getByRole("button", { name: /Pago en clínica/ })).toBeVisible();
});

test.describe("ofertas visibles @prod", () => {
  test("programa de rehabilitación kinésica pide datos y lleva al link correcto", async ({ page }) => {
    // El programa es externo (Tuu), así que Sakros captura los datos primero
    // y recién al final muestra el link que corresponde a la previsión.
    await page.route("**/api/program-interest", (r) => r.fulfill({ json: { ok: true } }));
    await page.goto("/reserva");
    await page.getByRole("button", { name: /Programa de Rehabilitación Kinésica/ }).click();
    await expect(page.getByRole("heading", { name: /Programa de Rehabilitación Kinésica/ })).toBeVisible();

    await page.getByLabel("Nombre completo *").fill("Paciente Programa");
    await page.getByLabel("Email *").fill("programa@example.com");
    await page.getByLabel("Teléfono *").fill("+56 9 1111 1111");
    await page.getByRole("button", { name: "FONASA" }).click();
    await page.getByRole("button", { name: /Continuar al programa/ }).click();

    await expect(page.getByRole("link", { name: /FONASA en Tuu/ })).toHaveAttribute(
      "href",
      "https://www.tuu.cl/programafonasa",
    );
  });

  test("kinesiología muestra valor de sesión y programa Fonasa/Isapre", async ({ page }) => {
    await page.goto("/servicios/kinesiologia");
    await expect(page.getByRole("heading", { name: "Opciones y valores" })).toBeVisible();
    await expect(page.getByText(sessionPrices.kinesiologia!)).toBeVisible();
    await expect(page.getByRole("link", { name: "Programa FONASA" })).toHaveAttribute("href", /tuu\.cl\/programafonasa/);
    await expect(page.getByRole("link", { name: "Programa ISAPRE" })).toHaveAttribute("href", /tuu\.cl\/programaisapre/);
  });

  test("osteopatía muestra sesión y programa de 5 sesiones con su pago", async ({ page }) => {
    await page.goto("/servicios/osteopatia");
    await expect(page.getByRole("heading", { name: "Opciones y valores" })).toBeVisible();
    const pack = servicePacks.osteopatia;
    await expect(page.getByText(pack.name)).toBeVisible();
    await expect(page.getByText(pack.price!)).toBeVisible();
    await expect(page.getByRole("link", { name: "Comprar programa" })).toHaveAttribute(
      "href",
      pack.paymentUrl!
    );
  });
});

test.describe("celular @mobile @prod", () => {
  for (const path of ["/", "/servicios/kinesiologia", "/servicios/osteopatia", "/reserva", "/contacto"]) {
    test(`${path} sin scroll horizontal y con reserva a mano`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.getByRole("link", { name: /Reserva/ }).first()).toBeAttached();
    });
  }
});
