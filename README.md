# Sakros — sitio web (Fase 0-2)

Next.js (App Router) + TypeScript + Tailwind. Migración desde el Wix anterior
(www.sakros.cl), siguiendo el mismo proceso por fases usado en metodorest.cl.

## Estructura

- `/` — Home, hero orientado a "volver a entrenar sin dolor" (ex-deportistas).
- `/servicios` y `/servicios/[slug]` — Osteopatía, Kinesiología, Posturología,
  Plantillas Ortopédicas, Actividad Física Dirigida, Estudio Biomecánico del Pie.
- `/quienes-somos` — equipo y formación, con JSON-LD `Person`.
- `/evidencia-metodologia` — el diferenciador de transparencia epistémica,
  estructurado en niveles (firme / razonamiento clínico / debatido).
- `/packs-tratamiento` — packs de sesiones (precios placeholder).
- `/contacto` — formulario (envía por Resend) + WhatsApp.
- `/blog` y `/blog/[slug]` — 2 posts de ejemplo, marcados como borrador.
- `app/sitemap.ts`, `app/robots.ts` — generados dinámicamente.
- `next.config.ts` — redirects 301 desde las URLs del Wix anterior.

## Pendiente de tu parte antes de publicar (no técnico)

1. **Dominio `osteopatiayposturologia.cl`**: aparecía pegado como
   título/dominio en 3 páginas del Wix viejo. ¿Es tuyo? Define si se
   redirige a sakros.cl o queda aparte.
2. **Sistema de reservas**: el botón "Reserva" hoy apunta a WhatsApp
   (`+56 9 4539 9692`) como opción segura y ya operativa. Confirma si se
   queda así o migramos a un booking externo/propio.
3. **Contenido del blog**: los 2 posts son borradores de estructura, no
   contenido clínico real — están excluidos del sitemap a propósito para
   que no se indexen así. Revísalos y reescríbelos con tu criterio antes
   de publicarlos.
4. **Precios de `/packs-tratamiento`**: son placeholder ("Consultar").
5. **Correo del formulario**: usa el dominio de pruebas de Resend
   (`onboarding@resend.dev`) como remitente porque `contacto@sakros.cl`
   no existe todavía. Cuando definas correo corporativo, se actualiza.
6. **Niveles de evidencia** en `/evidencia-metodologia`: dejé un ejemplo
   por nivel; hay que completarlos con los puntos reales de tu práctica.

## Pendiente técnico (antes de producción)

- Configurar `RESEND_API_KEY` en Vercel (Production **y** Preview).
- Verificar el dominio `sakros.cl` en Resend cuando exista el correo
  corporativo, para poder enviar como `contacto@sakros.cl`.
- Generar `og-image.jpg` real (1200×630) en `public/`.
- Apuntar DNS de `sakros.cl`/`www.sakros.cl` a Vercel y confirmar canonical.
- Reenviar sitemap nuevo en Google Search Console tras el deploy.
