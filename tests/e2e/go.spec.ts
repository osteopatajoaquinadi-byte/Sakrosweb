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
    ["Fundamentos", { programa: "base", nivel: 2 }],
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

  test("los tests no incluyen agilidad, velocidad, resistencia de campo ni squeeze", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { quien: { rol: "coach", atleta: null, email: "coach@sakros.cl" }, docs: [atleta("u2", { programa: "rend", nombre: "Beto" })] });
    await page.goto("/go");
    await page.locator("#atleta-sel").selectOption("u2");
    await page.getByRole("tab", { name: "Tests" }).click();
    await expect(page.getByText("Tests de campo").first()).toBeVisible();
    const txt = await page.locator("main").innerText();
    expect(txt).toContain("Salto vertical CMJ");
    // La evaluación de movilidad y control va justo después del encabezado de los tests.
    const tit = await page.locator("main section h2").allTextContents();
    expect(tit.slice(0, 2)).toEqual(["Tests · Beto", "Evaluación de movilidad y control"]);
    // «Tu progreso» va al final, justo antes de «Cómo medirlos».
    expect(tit.indexOf("Tu progreso")).toBe(tit.indexOf("Cómo medirlos") - 1);
    expect(txt).not.toMatch(/Sprint 10|Sprint 20|Agilidad|2,4 km|FC de recuperación|Squeeze/i);
    expect(errores).toEqual([]);
  });

  test("entrenador: el panel Equipo muestra quién entrenó y quién no", async ({ page }) => {
    const errores = vigilarErrores(page);
    const ahora = Date.now(), dia = 86400000;
    const reg = (a: string, id: string, semana: number, d: string, ej: string, t: number) => ({ path: `a/${a}/registro`, id, data: { ej, dia: d, semana, hecho: true, t } });
    await montarGo(page, {
      quien: { rol: "coach", atleta: null, email: "coach@sakros.cl" },
      docs: [
        atleta("u1", { programa: "rend", nombre: "Ana", frecuencia: 3 }),
        atleta("u2", { programa: "rend", nombre: "Beto", frecuencia: 3 }),
        atleta("u3", { programa: "base", nombre: "Caro", frecuencia: 2 }),
        reg("u1", "2A-cargada", 2, "A", "cargada", ahora - 3600000),
        reg("u1", "1A-cargada", 1, "A", "cargada", ahora - 4 * dia),
        reg("u2", "1A-cargada", 1, "A", "cargada", ahora - 8 * dia),
        reg("u2", "1B-pushpress", 1, "B", "pushpress", ahora - 7 * dia),
      ],
    });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Equipo" }).click();
    const filas = page.locator(".eqrow");
    await expect(filas).toHaveCount(3);
    // Primero quien lleva más días sin entrenar.
    await expect(filas.nth(0)).toContainText("Beto");
    await expect(filas.nth(0)).toHaveClass(/rojo/);
    await expect(filas.nth(0)).toContainText("Semana 1 · 2 de 3");
    await expect(filas.nth(0)).toContainText("hace 7 días");
    await expect(page.getByRole("button", { name: /^Caro:/ })).toContainText("Nunca ha marcado un ejercicio");
    await expect(page.getByRole("group", { name: "Semana" })).toHaveCount(0);
    const ana = page.getByRole("button", { name: /^Ana:/ });
    await expect(ana).toHaveClass(/ ok/);
    await expect(ana).toContainText("Semana 2 · 1 de 3");
    await expect(ana).toContainText("(hoy)");
    await ana.click();
    await expect(page.getByRole("tab", { name: "Progreso" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#atleta-sel")).toHaveValue("u1");
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

  test("cada prueba de movilidad y control muestra su video de ejemplo", async ({ page, request }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Tests" }).click();
    await page.getByRole("button", { name: /Hacer mi evaluación/ }).first().click();
    const ejemplos = page.locator(".fmsejv");
    await expect(ejemplos).toHaveCount(7);
    const fuentes = await page.locator(".fmsejv video").evaluateAll((vs) => vs.map((v) => v.getAttribute("src") || ""));
    for (const src of fuentes) {
      expect((await request.get(src)).status(), src).toBe(200);
      expect((await request.get(src.replace(".mp4", ".jpg"))).status()).toBe(200);
    }
    await page.locator("details:has(.fmsejv) > summary").first().click();
    await expect(ejemplos.first().locator("video")).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("en Tests, la evaluación de movimiento va primero y el resto queda en complementarios plegados", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend" }), { path: "a/u1/sesiones", id: "1A", data: { semana: 1, dia: "A", fecha: "01/11" } }] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await expect(page.getByRole("heading", { name: "Haz tu evaluación de movimiento" })).toBeVisible();
    await page.getByRole("tab", { name: "Tests" }).click();
    const comp = page.locator("#tests-comp");
    await expect(comp).not.toHaveAttribute("open", "");
    await expect(page.getByRole("heading", { name: "Tests de campo" })).toBeHidden();
    const yFms = (await page.getByRole("button", { name: /Hacer mi evaluación/ }).boundingBox())!.y;
    expect(yFms).toBeLessThan((await comp.boundingBox())!.y);
    await page.locator("#tests-comp > summary").click();
    await expect(page.getByRole("heading", { name: "Tests de campo" })).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("un cliente parte en Hoy y ve cuántas pruebas de la evaluación le faltan", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fms = { r: { ds: { rev: { u: 2 } }, hs: { rev: { d: 2, i: 2 } }, il: { rev: { d: 3, i: 2 } } } };
    await montarGo(page, { docs: [atleta("u1", { programa: "rend" }), { path: "a/u1/tests", id: "fms", data: fms }] });
    await page.goto("/go");
    await expect(page.getByRole("tab", { name: "Hoy" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "Termina tu evaluación de movimiento" })).toBeVisible();
    await expect(page.getByText("3 de 7 pruebas")).toBeVisible();
    // Lo primero que ve es su sesión de hoy; la evaluación queda debajo.
    const orden = await page.evaluate(() => [...document.querySelectorAll("main h2")].map((x) => x.textContent || ""));
    const iSes = orden.findIndex((t) => /Hoy toca/.test(t)), iEval = orden.findIndex((t) => /evaluación de movimiento/.test(t));
    expect(iSes).toBeGreaterThanOrEqual(0);
    expect(iSes).toBeLessThan(iEval);
    await expect(page.getByText("Qué vas a hacer hoy")).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    await page.getByRole("button", { name: "Seguir mi evaluación" }).click();
    await expect(page.getByText("3 de 7 pruebas").first()).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("subir el video de una prueba saca los cuadros, los sube y pide el análisis", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Tests" }).click();
    await page.getByRole("button", { name: /Hacer mi evaluación/ }).first().click();
    await page.locator("details:has(.fmsejv) > summary").first().click();
    await page.locator("#fv-ds-u").setInputFiles("tests/e2e/fixtures/prueba.webm");
    await expect.poll(() => fake.subidas.length, { timeout: 30_000 }).toBe(10);
    await expect.poll(() => fake.fms.length, { timeout: 15_000 }).toBe(1);
    await expect(page.getByText("Prueba simulada.")).toBeVisible();
    expect(fake.errores).toEqual([]);
    expect(errores).toEqual([]);
  });

  test("en una prueba con dos lados se sube un solo video y el Coach puntúa cada lado", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Tests" }).click();
    await page.getByRole("button", { name: /Hacer mi evaluación/ }).first().click();
    await page.locator("details:has(.fmsejv) > summary", { hasText: "Paso de valla" }).click();
    await expect(page.locator("#fv-hs-d")).toHaveCount(0);
    await page.locator("#fv-hs-a").setInputFiles("tests/e2e/fixtures/prueba.webm");
    await expect.poll(() => fake.subidas.length, { timeout: 40_000 }).toBe(20);
    await expect.poll(() => fake.fms.length, { timeout: 15_000 }).toBe(1);
    const body = fake.fms[0] as { test: string; lados: Record<string, string[]>; solo: string[] };
    expect(body.test).toBe("hs");
    expect(Object.keys(body.lados)).toEqual(["a"]);
    expect(body.lados.a).toHaveLength(20);
    expect(body.solo).toEqual(["d", "i"]);
    expect(fake.errores).toEqual([]);
    expect(errores).toEqual([]);
  });

  test("quien elige ir directo al entrenamiento sigue sin evaluación y lo ve en Tests", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { docs: [atleta("u1", { programa: "rend" }), { path: "a/u1/sesiones", id: "1A", data: { semana: 1, dia: "A", fecha: "01/11" } }] });
    await page.goto("/go");
    await page.getByRole("button", { name: "Quiero ir directo al entrenamiento" }).click();
    await expect.poll(() => fake.doc("atletas", "u1")?.fmsNo).toBe(true);
    await expect(page.getByRole("heading", { name: "Haz tu evaluación de movimiento" })).toBeHidden();
    await page.getByRole("tab", { name: "Tests" }).click();
    await expect(page.getByText(/Elegiste ir directo al entrenamiento/)).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("sin evaluación, la primera sesión es genérica y la evaluación se pide después", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend" })] });
    await page.goto("/go");
    await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Haz tu evaluación de movimiento" })).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test("quien marca señales de alarma al entrar parte con plan suave y se avisa al entrenador", async ({ page }) => {
    const errores = vigilarErrores(page);
    const fake = await montarGo(page, { docs: [atleta("u1", { onb: null, programa: null, sexo: null })] });
    await page.goto("/go");
    await page.getByRole("button", { name: /Rendir más en mi deporte/ }).click();
    await page.getByRole("button", { name: /^2 días/ }).click();
    await page.getByRole("button", { name: "Rodilla" }).click();
    await expect(page.getByRole("button", { name: "Ver mi plan" })).toBeDisabled();
    await page.getByRole("button", { name: "Menos de 6 semanas" }).click();
    await page.getByRole("group", { name: /Cuánto te duele/ }).getByRole("button", { name: "8", exact: true }).click();
    await page.getByRole("button", { name: "Ver mi plan" }).click();
    await expect(page.getByText(/Partimos con un plan suave/)).toBeVisible();
    await page.locator("#onb-nom").fill("Ana");
    await page.locator("#onb-sexo").selectOption("M");
    await page.locator("#onb-tc").check();
    await page.locator("#onb-salud").check();
    await page.getByRole("button", { name: "Crear mi plan" }).click();
    await expect(page.getByRole("heading", { name: "Antes de cargar, evalúate con un profesional" })).toBeVisible();
    const a = fake.doc("atletas", "u1") as { alerta?: { motivos: string[]; ok: boolean }; nivel?: number };
    expect(a.alerta?.motivos).toEqual(["lesión de menos de 6 semanas", "dolor de 8 de 10"]);
    expect(a.nivel).toBe(1);
    await expect.poll(() => fake.avisos.map((x) => x.tipo)).toEqual(["alerta"]);
    await page.getByRole("button", { name: "Ya me evaluó un profesional" }).click();
    await expect(page.getByRole("heading", { name: "Antes de cargar, evalúate con un profesional" })).toBeHidden();
    expect(errores).toEqual([]);
  });

  test("Rendimiento: la preparación dura máximo 12 min y su movilidad son 2 correctivos del FMS", async ({ page }) => {
    const errores = vigilarErrores(page);
    const r = { ds: { rev: { u: 1 } }, hs: { rev: { d: 2, i: 2 } }, il: { rev: { d: 3, i: 3 } }, sm: { rev: { d: 3, i: 3 } }, aslr: { rev: { d: 3, i: 3 } }, tspu: { rev: { u: 2 } }, rs: { rev: { d: 2, i: 2 } } };
    await montarGo(page, { docs: [atleta("u1", { programa: "rend", frecuencia: 3 }), { path: "a/u1/tests", id: "fms", data: { r } }] });
    await page.goto("/go");
    await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
    await expect.poll(() => page.evaluate("fmsListo()")).toBe(true); // la evaluación llega después de la ficha
    const ses = (await page.evaluate(`(() => { const out = []; for (let s = 1; s <= 2; s++) for (const d of DIAS()) out.push(rows(d, s).map(i => i.id)); return out; })()`)) as string[][];
    const corr = (ids: string[]) => ids.filter((i) => /^f(ds|hs|il|sm|aslr|tspu|rs)[1-4]$/.test(i));
    for (const ids of ses) {
      expect(ids.some((i) => /^mov/.test(i))).toBe(false);
      expect(corr(ids)[0]).toBe("fds1");
      expect(corr(ids)).toHaveLength(2);
    }
    const prep = (await page.evaluate(`(() => DIAS().map(d => rows(d, 1).filter(i => String(i.b).startsWith('1')).reduce((x, i) => x + tmin(i, 1), 0)))()`)) as number[];
    for (const m of prep) expect(m).toBeLessThanOrEqual(12);
    expect(new Set(ses.flatMap(corr))).toEqual(new Set(["fds1", "frs2", "ftspu2", "fhs2"]));
    expect(errores).toEqual([]);
  });

  test("la prueba gratis son 3 entrenamientos terminados, en Prep y en el entrenamiento", async ({ page }) => {
    const errores = vigilarErrores(page);
    const acceso = { rol: "cliente", activo: false, terminosV: "2026-11", venta: { activo: false } };
    const ses = (ids: string[]) => ids.map((id) => ({ path: "a/u1/sesiones", id, data: { semana: 1, dia: id.slice(-1), min: "40", t: Date.now() } }));
    // Prep: con 2 terminadas le queda 1; con 3, pide la suscripción.
    await montarGo(page, { docs: [atleta("u1", { programa: "prep" }), ...ses(["p1PI", "p2PS"])], acceso });
    await page.goto("/go");
    await expect(page.getByText(/Tienes 3 entrenamientos gratis \(te queda 1\)/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "¿Qué vas a entrenar hoy?" })).toBeVisible();
    await expect(page.getByText(/Unos 12 minutos antes de entrenar/)).toBeVisible();
    await montarGo(page, { docs: [atleta("u1", { programa: "prep" }), ...ses(["p1PI", "p2PS", "p3PC"])], acceso });
    await page.goto("/go");
    await expect(page.getByText("Terminaste tus 3 entrenamientos de prueba")).toBeVisible();
    // Entrenamiento con 2 días: el día A de la semana 2 es el tercero y sigue gratis; el cuarto no.
    await montarGo(page, { docs: [atleta("u1", { programa: "global", frecuencia: 2 }), ...ses(["g1A", "g1B"])], acceso });
    await page.goto("/go");
    await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
    await expect(page.getByText(/Terminaste tus 3 entrenamientos/)).toHaveCount(0);
    await montarGo(page, { docs: [atleta("u1", { programa: "global", frecuencia: 2 }), ...ses(["g1A", "g1B", "g2A"])], acceso });
    await page.goto("/go");
    await expect(page.getByText(/Ya usaste tus 3 entrenamientos gratis/)).toBeVisible();
    // El cuarto entrenamiento queda bloqueado; uno ya terminado se puede volver a abrir.
    expect(await page.evaluate("[bloqueada(2,'B'), bloqueada(3,'A'), bloqueada(1,'A')]")).toEqual([true, true, false]);
    expect(errores).toEqual([]);
  });

  test("con 12 o menos en la evaluación no se propone Fundamentos: se alarga el tejido blando", async ({ page }) => {
    const errores = vigilarErrores(page);
    // 1+2+2+1+2+2+2 = 12 de 21
    const r = { ds: { rev: { u: 1 } }, hs: { rev: { d: 2, i: 2 } }, il: { rev: { d: 2, i: 2 } }, sm: { rev: { d: 1, i: 1 } }, aslr: { rev: { d: 2, i: 2 } }, tspu: { rev: { u: 2 } }, rs: { rev: { d: 2, i: 2 } } };
    for (const programa of ["global", "rend"]) {
      await montarGo(page, { docs: [atleta("u1", { programa, frecuencia: 2 }), { path: "a/u1/tests", id: "fms", data: { r } }] });
      await page.goto("/go");
      await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
      await expect.poll(() => page.evaluate("fmsListo()")).toBe(true);
      await expect(page.getByText(/Fundamentos|empezar por el Entrenamiento/)).toHaveCount(0);
      const prim = (await page.evaluate(`(() => DIAS().map(d => { const t = rows(d, 1).find(i => /^tejido[AB]$/.test(i.id)); return t ? PP(t)[0] : null; }))()`)) as (string | null)[];
      for (const p of prim) expect(p).toMatch(/3 grupos, 45–90 s/);
    }
    expect(errores).toEqual([]);
  });

  test("el plan personal del atleta cambia, suma ejercicios y agrega indicaciones a su sesión", async ({ page }) => {
    const errores = vigilarErrores(page);
    const plan = {
      sust: { pushpress: "klandmine" },
      sustP: { klandmine: Array(8).fill("3×6/lado · RPE 7") },
      extra: { A: [{ id: "copenhague", p: Array(8).fill("2×20 s/lado") }], B: [{ id: "kbirddogc", p: Array(8).fill("3×6/lado · 3 s") }] },
      notas: { sentadilla: "hasta el paralelo" },
    };
    await montarGo(page, { docs: [atleta("u1", { programa: "rend", frecuencia: 3, cargas: { cargada: 75 }, plan })] });
    await page.goto("/go");
    await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
    await expect.poll(() => page.evaluate("!!(atl().plan && atl().plan.extra)")).toBe(true); // espera la ficha del servidor
    const r = (await page.evaluate(`(() => ['A','B'].map(d => rows(d,1).map(i => [i.id, pres(1,d,i)])))()`)) as [string, string][][];
    const de = (dia: [string, string][], id: string) => dia.find((x) => x[0] === id)?.[1];
    expect(de(r[0], "copenhague")).toBe("2×20 s/lado");
    expect(de(r[0], "sentadilla")).toContain("hasta el paralelo");
    expect(de(r[0], "cargada")).toContain("75 kg");
    expect(de(r[1], "pushpress")).toBeUndefined();
    expect(de(r[1], "klandmine")).toBe("3×6/lado · RPE 7");
    expect(de(r[1], "kbirddogc")).toBe("3×6/lado · 3 s");
    expect(r[0][r[0].length - 1][0]).toBe("regen");
    expect(errores).toEqual([]);
  });

  test("Rendimiento: el RPE se lee en la sesión, la semana 2 progresa y la competencia afina las semanas 3 y 4", async ({ page }) => {
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend", frecuencia: 3, cargas: { cargada: 80 }, plan: { afina: 4 } })] });
    await page.goto("/go");
    await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
    const p = (await page.evaluate(`(() => { const g = (s, d, id) => { const it = rows(d, s).find((i) => i.id === id); return it ? pres(s, d, it) : null };
      return { sen1: g(1,'A','sentadilla'), sen2: g(1+1,'A','sentadilla'), car1: g(1,'A','cargada'), remo1: g(1,'A','kremomanc'), remo2: g(2,'A','kremomanc'),
        dom3: g(3,'B','dominadas'), c4: rows('C', 4).map((i) => i.id), afina: afinaTxt(4, 'C') } })()`)) as Record<string, any>;
    expect(p.sen1).toContain("RPE 7 (quedan 3 en reserva)");
    expect(p.sen2).toContain("RPE 7–8");
    expect(p.sen2).not.toBe(p.sen1);
    expect(p.car1).toContain("80 kg");
    expect(p.remo2).not.toBe(p.remo1);
    expect(p.dom3).toBe("3×7");
    expect(p.c4).not.toContain("sentadilla");
    expect(p.c4).not.toContain("hipthrust");
    expect(p.c4[p.c4.length - 1]).toBe("regen");
    expect(p.afina).toContain("Activación previa a la competencia");
    expect(errores).toEqual([]);
  });

  test("Rendimiento: los ejercicios de fuerza y halterofilia varían entre semanas, sin tocar descarga, tests ni el plan del entrenador", async ({ page }) => {
    const errores = vigilarErrores(page);
    const ver = async (plan?: Record<string, unknown>) => {
      await montarGo(page, { docs: [atleta("u1", { programa: "rend", frecuencia: 3, cargas: { cargada: 80 }, plan })] });
      await page.goto("/go");
      await expect(page.getByText(/Hoy toca/).first()).toBeVisible();
      await expect.poll(() => page.evaluate("esRend() && !!(atl().cargas && atl().cargas.cargada)")).toBe(true);
      if (plan) await expect.poll(() => page.evaluate("!!(atl().plan && atl().plan.notas)")).toBe(true);
      return (await page.evaluate(`(() => { const ids = (d, s) => rows(d, s).map((i) => i.id);
        const js = rows('C', 5).find((i) => i.id === 'jumpshrug');
        return { a1: ids('A',1), a2: ids('A',2), a4: ids('A',4), a5: ids('A',5), a6: ids('A',6), a8: ids('A',8), b5: ids('B',5), c3: ids('C',3), c5: ids('C',5), c8: ids('C',8),
          js5: js ? pres(5, 'C', js) : null } })()`)) as Record<string, any>;
    };
    const p = await ver();
    expect(p.a1).toContain("cargada");
    expect(p.a2).toContain("jumpshrug");
    expect(p.a5).toContain("powerclean");
    expect(p.a5).toContain("bulgaram");
    expect(p.a6).toContain("cargada");
    for (const s of [p.a4, p.a8]) { expect(s).toContain("cargada"); expect(s).toContain("ksplit"); }
    expect(p.b5).toEqual(expect.arrayContaining(["pushjerk", "trapbar"]));
    expect(p.c3).not.toContain("jumpshrug");
    expect(p.c5).toEqual(expect.arrayContaining(["jumpshrug", "rdlbarra"]));
    expect(p.c5.indexOf("jumpshrug")).toBeLessThan(p.c5.indexOf("puenteexp"));
    expect(p.c8).not.toContain("jumpshrug");
    expect(p.js5).toMatch(/3×3 · \d+(,\d)? kg/);
    const g = await ver({ notas: { cargada: "desde arriba de la rodilla" }, sust: { pushpress: "klandmine" } });
    expect(g.a2).toContain("cargada");
    expect(g.a5).toContain("cargada");
    expect(g.b5).not.toContain("pushjerk");
    expect(errores).toEqual([]);
  });

  test("la sesión no muestra «null» y el video cabe en la pantalla", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
    const errores = vigilarErrores(page);
    await montarGo(page, { docs: [atleta("u1", { programa: "rend", frecuencia: 3 })] });
    await page.goto("/go");
    await page.getByRole("tab", { name: "Hoy" }).click();
    await page.getByRole("button", { name: /Empezar/ }).first().click();
    await page.getByRole("button", { name: "Saltar" }).first().click().catch(() => {});
    for (let i = 0; i < 6; i++) {
      const nulos = await page.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, c = 0; while ((n = w.nextNode())) if (n.textContent!.trim() === "null") c++; return c; });
      expect(nulos).toBe(0);
      const alto = await page.evaluate(() => { const m = document.querySelector(".media.play") as HTMLElement | null; return m ? m.getBoundingClientRect().height : 0; });
      expect(alto).toBeLessThanOrEqual(800 * 0.6);
      await page.getByRole("button", { name: /Hecho, siguiente/ }).click();
    }
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
