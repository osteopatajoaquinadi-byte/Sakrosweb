/* Sakros Go: funciona sin conexión.
   - La app (/go) se pide primero a la red y, si no hay conexión, se usa la última copia.
   - Fotos, videos e íconos de /go se guardan la primera vez que se ven.
   - Las fuentes de Google se guardan y se actualizan en segundo plano.
   - Nunca se guarda nada de /api ni de Supabase: esos datos los maneja la app. */
const VERSION = "sakros-go-v1";
const SHELL = ["/go", "/go/supabase.js", "/go/manifest.webmanifest", "/go/icon-192.png", "/go/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("sakros-go-") && k !== VERSION).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Solo /go (misma web) y fuentes de Google. Todo lo demás pasa directo.
  const esGo = url.origin === location.origin && (url.pathname === "/go" || url.pathname.startsWith("/go/"));
  const esFuente = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!esGo && !esFuente) return;
  if (req.headers.has("range")) return; // videos por partes: los maneja el navegador

  // La app: primero la red, si falla la copia guardada.
  if (req.mode === "navigate" || url.pathname === "/go" || url.pathname === "/go/index.html") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(VERSION).then((c) => c.put("/go", res.clone()));
          return res;
        })
        .catch(() => caches.match("/go").then((r) => r || caches.match(req))),
    );
    return;
  }

  // Archivos de /go y fuentes: la copia guardada y, en paralelo, se actualiza.
  e.respondWith(
    caches.open(VERSION).then((c) =>
      c.match(req).then((hit) => {
        const red = fetch(req)
          .then((res) => {
            if (res.ok && (res.type === "basic" || res.type === "cors")) c.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || red;
      }),
    ),
  );
});
