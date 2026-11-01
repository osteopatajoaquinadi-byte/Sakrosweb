import { expect, test, type Page } from "@playwright/test";
import { atleta, montarGo } from "./go-fake";

// Pruebas de la app Sakros Go (/go). Supabase y las APIs se simulan en
// go-fake.ts: se prueba la app completa (entrar, entrenar, guardar, Coach,
// errores) sin tocar datos reales.

function vigilarErrores(page: Page) {
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));
  return errores;
}

test.describe("Sakros Go", () => {
  test("sin sesión muestra el ingreso y envía el enlace al correo", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { sinSesion: true });
    await page.goto("/go");
    const correo = page.locator("#login-email");
    await expect(correo).toBeVisible();
    await correo.fill("ana@ejemplo.cl");
    await page.locator("main button").filter({ hasText: /enlace|Entrar|Enviar/i }).first().click();
    await expect.poll(() => fake.logins).toContain("ana@ejemplo.cl");
    expect(errores).toEqual([]);
  });

  test("cliente: entrena una sesión completa y queda guardada", async ({ page }) => {
    test.setTimeout(120_000);
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "global" })] });
    await page.goto("/go");
    await expect(page.locator("#sync")).toHaveText("Sincronizado");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await page.getByRole("button", { name: "Empezar" }).click();
    await page.getByRole("button", { name: "Saltar" }).click(); // pregunta de cómo llega hoy
    const hecho = page.getByRole("button", { name: /Hecho, siguiente/ });
    for (let i = 0; i < 20 && (await hecho.count()); i++) await hecho.click();
    await expect(page.getByRole("heading", { name: "¡Bien hecho!" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar y terminar" }).click();
    await expect.poll(() => fake.escrituras.some((e) => e.path === "a/u1/sesiones")).toBe(true);
    const registros = fake.escrituras.filter((e) => e.path === "a/u1/registro");
    expect(registros.length).toBeGreaterThan(5);
    expect(registros.every((e) => e.data.hecho === true && e.data.semana === 1)).toBe(true);
    expect(errores).toEqual([]);
    expect(fake.errores).toEqual([]);
  });

  const programas: [string, Record<string, unknown>][] = [
    ["Rendimiento", { programa: "rend" }],
    ["Rendimiento vóley", { programa: "rend", deporte: "voley" }],
    ["Activo", { programa: "global" }],
    ["Core", { programa: "core", condicion: "hernia" }],
    ["Base", { programa: "base", nivel: 2 }],
  ];
  for (const [nombre, datos] of programas) {
    test(`${nombre}: la sesión de hoy se abre con todos sus ejercicios`, async ({ page }) => {
      const errores = vigilarErrores(page);
      const fake = await montarGo(page, { docs: [atleta("u1", datos)] });
      await page.goto("/go");
      await page.getByRole("tab", { name: "Hoy" }).click();
      await page.getByRole("button", { name: "Ver la sesión completa" }).click();
      const tarjetas = page.locator("article.ex");
      await expect(tarjetas.first()).toBeVisible();
      expect(await tarjetas.count()).toBeGreaterThan(3);
      // Cada ejercicio muestra cómo se hace: video, animación o fotos.
      const sinMedia = await page.locator("article.ex.nomedia h3, article.ex.nomedia .exn").allTextContents();
      expect.soft(sinMedia, "ejercicios sin video, animación ni foto").toEqual([]);
      expect(errores).toEqual([]);
      expect(fake.errores).toEqual([]);
    });
  }

  test("Prep: elegir la zona del día abre la preparación", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "prep" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await page.locator("main button.bigopt").first().click();
    await page.getByRole("button", { name: "Saltar" }).click();
    await expect(page.getByRole("button", { name: /Hecho, siguiente/ })).toBeVisible();
    await expect(page.locator(".media").first()).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("las animaciones de la lista existen en la biblioteca del maniquí", async ({ page }) => {
    await montarGo(page, { docs: [atleta("u1", { programa: "core", condicion: "hernia" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await page.getByRole("button", { name: "Ver la sesión completa" }).click();
    await page.evaluate(() => (window as unknown as { cargaManiqui: () => Promise<unknown> }).cargaManiqui());
    const faltan = await page.evaluate(() => {
      const w = window as unknown as { ANIM?: Set<string>; MQ_EJ: Record<string, unknown> };
      // ANIM es una constante global de la app (no está en window): se lee por nombre.
      const anim = (0, eval)("ANIM") as Set<string>;
      return [...anim].filter((id) => !w.MQ_EJ[id]);
    });
    expect(faltan).toEqual([]);
  });

  test("Coach IA responde y no expone errores", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Coach" }).click();
    await page.locator("#chat-in").fill("¿Subo el peso la próxima semana?");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("Mañana sube 2,5 kg en la sentadilla.")).toBeVisible();
    expect(fake.coachLlamadas.length).toBe(1);
    await expect.poll(() => fake.escrituras.filter((e) => e.path === "a/u1/chat").length).toBeGreaterThanOrEqual(2);
    expect(errores).toEqual([]);
  });

  test("entrenador: ve a sus atletas y cambia entre ellos", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, {
      quien: { rol: "coach", atleta: null, email: "coach@sakros.cl" },
      docs: [atleta("u1", { programa: "global", nombre: "Ana" }), atleta("u2", { programa: "rend", nombre: "Beto" })],
    });
    await page.goto("/go");
    const sel = page.locator("#atleta-sel");
    await expect(sel.locator("option")).toHaveText(["Mi perfil", "Ana", "Beto"]);
    await sel.selectOption("u2");
    await page.getByRole("tab", { name: "Sesión" }).click();
    await expect(page.locator("article.ex").first()).toBeVisible();
    await expect(page.getByText("Rendimiento", { exact: false }).first()).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("un error inesperado de la app queda registrado", async ({ page }) => {
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "global" })] });
    await page.goto("/go");
    await expect(page.locator("#sync")).toHaveText("Sincronizado");
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error("Error de prueba");
      });
      setTimeout(() => {
        throw new Error("Error de prueba");
      });
      Promise.reject(new Error("Promesa de prueba"));
    });
    await expect.poll(() => fake.errores.map((e) => e.mensaje)).toEqual(
      expect.arrayContaining(["Error de prueba", "Promesa de prueba"]),
    );
    // El mismo error no se envía dos veces.
    expect(fake.errores.filter((e) => e.mensaje === "Error de prueba").length).toBe(1);
    expect(fake.errores.every((e) => e.version && e.url)).toBe(true);
  });

  test("si el servidor rechaza un guardado, queda en cola y se avisa", async ({ page }) => {
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "global" })], falloAlGuardar: true });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await page.getByRole("button", { name: "Empezar" }).click();
    await page.getByRole("button", { name: "Saltar" }).click();
    await page.getByRole("button", { name: /Hecho, siguiente/ }).click();
    await expect(page.locator("#sync")).toContainText("por enviar");
    await expect.poll(() => fake.errores.some((e) => e.tipo === "sincronizacion")).toBe(true);
    const cola = await page.evaluate(() => JSON.parse(localStorage.getItem("go-outbox") || "[]"));
    expect(cola.length).toBeGreaterThan(0);
  });

  test("si el servidor no responde, abre con la copia guardada en el teléfono", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await expect(page.locator("#sync")).toHaveText("Sincronizado");
    await expect.poll(() => page.evaluate(() => !!localStorage.getItem("go-cache"))).toBe(true);
    await page.route("**/api/go/config", (r) => r.fulfill({ status: 503, json: { error: "caído" } }));
    await page.reload();
    await expect(page.locator("#sync")).toContainText("Sin conexión");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("la ruta de errores rechaza envíos vacíos o inválidos", async ({ request }) => {
    expect((await request.post("/api/go/errores", { data: "" })).status()).toBe(400);
    expect((await request.post("/api/go/errores", { data: { mensaje: "" } })).status()).toBe(400);
    expect((await request.post("/api/go/errores", { headers: { "content-type": "application/json" }, data: "{no es json" })).status()).toBe(400);
  });

  test("en el celular la pantalla de hoy cabe sin desplazamiento lateral @mobile", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible();
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(ancho).toBeLessThanOrEqual(1);
    expect(errores).toEqual([]);
  });
});
