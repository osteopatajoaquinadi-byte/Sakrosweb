import { expect, test } from "@playwright/test";
import { buildIcs, chileToUtc } from "../../lib/calendar-invite";

test("convierte la hora de Chile a UTC con y sin horario de verano", () => {
  expect(chileToUtc("2026-10-06", "10:30").toISOString()).toBe("2026-10-06T13:30:00.000Z");
  expect(chileToUtc("2026-06-10", "10:30").toISOString()).toBe("2026-06-10T14:30:00.000Z");
});

test("la invitación y su cancelación comparten UID", () => {
  const base = {
    uid: "abc@sakros.cl",
    sequence: 1,
    start: chileToUtc("2026-10-06", "10:30"),
    end: chileToUtc("2026-10-06", "11:30"),
    summary: "Kinesiología — Paciente, Prueba",
    description: "Paciente: Prueba",
    location: "Sakros",
    attendee: "pro@example.com",
  };
  const invite = buildIcs({ ...base, method: "REQUEST" });
  const cancel = buildIcs({ ...base, method: "CANCEL", sequence: 2 });
  expect(invite).toContain("METHOD:REQUEST");
  expect(invite).toContain("DTSTART:20261006T133000Z");
  expect(invite).toContain("SUMMARY:Kinesiología — Paciente\\, Prueba");
  expect(cancel).toContain("UID:abc@sakros.cl");
  expect(cancel).toContain("STATUS:CANCELLED");
});
