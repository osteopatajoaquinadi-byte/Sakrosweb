import { expect, test, type Page } from "@playwright/test";

// Panel del equipo con la sesión y los datos simulados.

const roles = {
  admin: ["calendario", "agendar", "pacientes", "clinico", "pagos"],
  secretaria: ["calendario", "agendar", "pacientes", "pagos"],
};

async function mockPanel(page: Page, role: keyof typeof roles | null) {
  let user = role ? { username: role, display_name: role, role, professional_slug: null } : null;
  await page.route("**/api/equipo/me", (route) =>
    user
      ? route.fulfill({ json: { user, permissions: roles[user.role as keyof typeof roles] } })
      : route.fulfill({ status: 401, json: { user: null } })
  );
  await page.route("**/api/equipo/login", async (route) => {
    const { username, pin } = route.request().postDataJSON();
    if (pin !== "correcto") return route.fulfill({ status: 401, json: { error: "Usuario o PIN incorrecto." } });
    const r = username as keyof typeof roles;
    user = { username: r, display_name: r, role: r, professional_slug: null };
    return route.fulfill({ json: { user, permissions: roles[r] } });
  });
  await page.route("**/api/calendar**", (route) =>
    route.fulfill({ json: { bookings: [], totalSlots: 100, bookedSlots: 0 } })
  );
  await page.route("**/api/fichas/patients**", (route) => route.fulfill({ json: { patients: [] } }));
}

test("login: PIN incorrecto muestra error y no entra", async ({ page }) => {
  await mockPanel(page, null);
  await page.goto("/equipo");
  await page.getByPlaceholder("Usuario").fill("joaquin");
  await page.getByPlaceholder("PIN").fill("malo");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Usuario o PIN incorrecto.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Calendario" })).toHaveCount(0);
});

test("administrador ve calendario y pacientes clínicos", async ({ page }) => {
  await mockPanel(page, null);
  await page.goto("/equipo");
  await page.getByPlaceholder("Usuario").fill("admin");
  await page.getByPlaceholder("PIN").fill("correcto");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("button", { name: "Calendario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pacientes", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Agendar sesión o programa/ })).toBeVisible();
});

test("secretaría ve pacientes y pagos, sin datos clínicos", async ({ page }) => {
  await mockPanel(page, "secretaria");
  await page.goto("/equipo");
  await expect(page.getByRole("button", { name: "Pacientes y pagos" })).toBeVisible();
  await page.getByRole("button", { name: "Pacientes y pagos" }).click();
  await page.getByRole("button", { name: "+ Nuevo paciente" }).click();
  await expect(page.getByText("Motivo de consulta")).toHaveCount(0);
});
