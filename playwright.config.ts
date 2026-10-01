import { defineConfig, devices } from "@playwright/test";

// Pruebas automáticas del sitio (SEO, reserva, panel del equipo).
//
//   npm run test:e2e                         → compila y prueba en local
//   BASE_URL=https://www.sakros.cl npm run test:e2e -- --grep @prod
//                                            → solo las pruebas de solo lectura
//                                              contra el sitio publicado
//
// Las pruebas de reserva y panel simulan las APIs con page.route(), así que
// no necesitan Supabase ni crean datos reales.

const PORT = 3100;
const externalBase = process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBase ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "es-CL",
    timezoneId: "America/Santiago",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: externalBase
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});
