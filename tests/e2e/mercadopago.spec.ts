import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { validSignature } from "../../lib/mercadopago";

test("valida la firma de las notificaciones de Mercado Pago", () => {
  process.env.MP_WEBHOOK_SECRET = "secreto";
  const ts = "1700000000";
  const v1 = createHmac("sha256", "secreto").update(`id:123;request-id:req-1;ts:${ts};`).digest("hex");
  const ok = new Headers({ "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": "req-1" });
  const bad = new Headers({ "x-signature": `ts=${ts},v1=${"0".repeat(64)}`, "x-request-id": "req-1" });
  expect(validSignature(ok, "123")).toBe(true);
  expect(validSignature(bad, "123")).toBe(false);
  expect(validSignature(new Headers(), "123")).toBe(false);
  delete process.env.MP_WEBHOOK_SECRET;
});

test("el aviso de Mercado Pago responde 200 aunque la integración esté apagada @prod", async ({ request }) => {
  const res = await request.post("/api/pagos/mercadopago", { data: { type: "payment", data: { id: "1" } } });
  expect(res.status()).toBe(200);
});
