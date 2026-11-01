import type { Page, Request } from "@playwright/test";

// Supabase simulado para las pruebas de Sakros Go: base de datos en memoria
// (tabla go_docs), sesión iniciada, RPC go_vincular y APIs /api/go/*.
// Así se prueba la app completa (cargar, guardar, Coach) sin datos reales.

export type Doc = { path: string; id: string; data: Record<string, unknown> };
export type Quien = { rol: "cliente" | "coach"; atleta: string | null; email: string };

export type Opciones = {
  quien?: Quien;
  docs?: Doc[];
  acceso?: Record<string, unknown>;
  sinSesion?: boolean;
  coach?: (body: unknown) => Record<string, unknown>;
  /** Respuestas forzadas para un upsert (por ejemplo, simular un rechazo del servidor). */
  falloAlGuardar?: boolean;
};

export type Fake = {
  docs: Map<string, Doc>;
  escrituras: Doc[];
  errores: Record<string, unknown>[];
  coachLlamadas: unknown[];
  logins: string[];
  doc(path: string, id: string): Record<string, unknown> | undefined;
};

const SB = "/__sb";

export function atleta(id: string, datos: Record<string, unknown>): Doc {
  return {
    path: "atletas",
    id,
    data: { nombre: "Ana", sexo: "F", frecuencia: 2, onb: 1, terminos: { v: "2026-11" }, nivel: 1, t: 1, ...datos },
  };
}

function token(sub: string) {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub, exp, role: "authenticated", aud: "authenticated" })}.firma`;
}

function filtros(url: URL) {
  const f: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    if (v.startsWith("eq.")) f[k] = decodeURIComponent(v.slice(3));
  });
  return f;
}

export async function montarGo(page: Page, o: Opciones = {}): Promise<Fake> {
  const quien: Quien = o.quien ?? { rol: "cliente", atleta: "u1", email: "ana@ejemplo.cl" };
  const docs = new Map<string, Doc>();
  for (const d of o.docs ?? []) docs.set(d.path + "|" + d.id, structuredClone(d));
  const fake: Fake = {
    docs,
    escrituras: [],
    errores: [],
    coachLlamadas: [],
    logins: [],
    doc: (path, id) => docs.get(path + "|" + id)?.data,
  };

  // Sesión guardada como la deja supabase-js: la app entra sin pedir enlace.
  if (!o.sinSesion) {
    const uid = "00000000-0000-4000-8000-000000000001";
    const sesion = {
      access_token: token(uid),
      refresh_token: "r1",
      token_type: "bearer",
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      user: { id: uid, aud: "authenticated", role: "authenticated", email: quien.email, app_metadata: {}, user_metadata: {} },
    };
    await page.addInitScript((s) => {
      try {
        localStorage.setItem("sakros-go-auth", s);
        localStorage.setItem("go-instalada", "1");
      } catch {}
    }, JSON.stringify(sesion));
  }

  await page.route("**/api/go/config", (r) =>
    r.fulfill({ json: { url: new URL(r.request().url()).origin + SB, anonKey: "anon-prueba" } }),
  );
  await page.route("**/api/go/acceso", (r) =>
    r.fulfill({
      json: o.acceso ?? {
        rol: quien.rol,
        activo: true,
        plan: "entrenamiento",
        hasta: new Date(Date.now() + 20 * 86400000).toISOString(),
        terminosV: "2026-11",
        venta: { activo: false },
      },
    }),
  );
  await page.route("**/api/go/errores", (r) => {
    try {
      fake.errores.push(JSON.parse(r.request().postData() || "{}"));
    } catch {}
    return r.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/go/login", (r) => {
    try {
      fake.logins.push(String(JSON.parse(r.request().postData() || "{}").email));
    } catch {}
    return r.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/go/claude", (r) => {
    const body = JSON.parse(r.request().postData() || "{}");
    fake.coachLlamadas.push(body);
    return r.fulfill({
      json: o.coach?.(body) ?? { content: [{ type: "text", text: "Buen trabajo. Mañana sube 2,5 kg en la sentadilla." }], stop_reason: "end_turn" },
    });
  });
  // Videos de ejemplo: no se necesitan para las pruebas.
  await page.route("**/go/media/**", (r) => r.fulfill({ status: 204, body: "" }));

  // Tiempo real: se acepta la conexión y no se envía nada.
  await page.routeWebSocket(/\/__sb\/realtime\//, () => {});

  await page.route(new RegExp(SB.replace("/", "\\/") + "\\/auth\\/"), (r) => r.fulfill({ status: 204, body: "" }));
  await page.route(/\/__sb\/rest\/v1\/rpc\/go_vincular/, (r) => r.fulfill({ json: quien }));
  await page.route(/\/__sb\/rest\/v1\/go_docs/, (r) => responderDocs(r.request(), fake, o).then((res) => r.fulfill(res)));
  return fake;
}

async function responderDocs(req: Request, fake: Fake, o: Opciones) {
  const url = new URL(req.url());
  const f = filtros(url);
  const m = req.method();
  if (m === "GET" || m === "HEAD") {
    const filas = [...fake.docs.values()]
      .filter((d) => d.path === f.path && (!f.id || d.id === f.id))
      .map((d) => ({ id: d.id, data: d.data }));
    return { json: filas };
  }
  if (m === "POST") {
    if (o.falloAlGuardar) return { status: 403, json: { code: "42501", message: "new row violates row-level security policy" } };
    const cuerpo = JSON.parse(req.postData() || "[]");
    for (const fila of Array.isArray(cuerpo) ? cuerpo : [cuerpo]) {
      const d = { path: String(fila.path), id: String(fila.id), data: fila.data };
      fake.docs.set(d.path + "|" + d.id, d);
      fake.escrituras.push(d);
    }
    return { status: 201, body: "" };
  }
  if (m === "DELETE") {
    for (const k of [...fake.docs.keys()]) {
      const d = fake.docs.get(k)!;
      if (d.path === f.path && (!f.id || d.id === f.id)) fake.docs.delete(k);
    }
    return { status: 204, body: "" };
  }
  return { status: 405, body: "" };
}
