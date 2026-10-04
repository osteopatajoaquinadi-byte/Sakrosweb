import { expect, test, type Page } from "@playwright/test";
import { paymentLinks, servicePacks, sessionPrices } from "../../lib/site-config";

// Flujo de reserva con las APIs simuladas: no toca Supabase ni crea reservas.
async function mockBookingApis(page: Page) {
  const posted: Record<string, unknown>[] = [];
  await page.route("**/api/week-availability**", async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const from = params.get("from")!;
    const days = Number(params.get("days") || 14);
    const available: Record<string, number> = {};
    // Desde mañana, para no depender de la hora a la que corre la prueba.
    for (let i = 1; i <= days; i++) {
      const d = new Date(`${from}T12:00:00Z`);
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
  await page.getByRole("button", { name: /Próxima fecha disponible/ }).click();
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

test("programa de rehabilitación: agenda primero y elige FONASA/ISAPRE al final", async ({ page }) => {
  const posted = await mockBookingApis(page);
  await page.goto("/reserva");
  await page.getByRole("button", { name: /Programa de Rehabilitación Kinésica/ }).click();
  await page.getByRole("button", { name: /Próxima fecha disponible/ }).click();
  await page.getByRole("button", { name: /10:30/ }).click();
  await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();

  await page.getByLabel("Nombre completo *").fill("Paciente Programa");
  await page.getByLabel("Email *").fill("programa@example.com");
  // Sin previsión no se puede confirmar.
  await expect(page.getByRole("button", { name: "Confirmar reserva" })).toBeDisabled();
  await page.getByRole("button", { name: /^FONASA/ }).click();
  await expect(page.getByText("$190.000").first()).toBeVisible();
  await page.getByRole("button", { name: /Pago con tarjeta/ }).click();
  await page.getByRole("button", { name: "Confirmar reserva" }).click();

  await expect(page.getByText("Reserva confirmada")).toBeVisible();
  await expect(page.getByRole("link", { name: /Pagar \$190\.000 con tarjeta/ })).toHaveAttribute(
    "href",
    "https://www.tuu.cl/programafonasa",
  );
  expect(posted[0]).toMatchObject({ payment_method: "online_webpay" });
  expect(String(posted[0].notes)).toContain("[Programa Rehabilitación FONASA]");
});

test("contacto lleva a reservar en el calendario propio @prod", async ({ page }) => {
  await page.goto("/contacto");
  await expect(page.getByRole("link", { name: "Reservar hora" })).toHaveAttribute("href", "/reserva");
});

test.describe("ofertas visibles @prod", () => {
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

test("posturología ofrece pago online de sesión y pack de 5", async ({ page }) => {
  await page.goto("/servicios/posturologia");
  await expect(page.getByRole("link", { name: "Comprar programa" })).toHaveAttribute("href", servicePacks.posturologia.paymentUrl!);
  await mockBookingApis(page);
  await bookUntilDetails(page, "posturologia");
  await expect(page.getByRole("button", { name: /Pago online/ })).toBeVisible();
});

test("estudio biomecánico (evaluación del pie) ofrece pago online", async ({ page }) => {
  await mockBookingApis(page);
  await bookUntilDetails(page, "estudio-biomecanico");
  await expect(page.getByRole("button", { name: /Pago online/ })).toBeVisible();
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
