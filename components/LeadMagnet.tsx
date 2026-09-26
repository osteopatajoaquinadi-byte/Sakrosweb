"use client";

import { useState, type FormEvent } from "react";

export default function LeadMagnet() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) throw new Error("Error del servidor");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <section className="bg-teal-700">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <div className="mx-auto max-w-lg">
            <p className="text-3xl mb-3">✅</p>
            <h2 className="text-2xl font-bold text-white mb-3">
              Revisa tu email
            </h2>
            <p className="text-teal-100">
              Te enviamos la guía a <strong className="text-white">{email}</strong>.
              Si no la ves en unos minutos, revisa tu carpeta de spam.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-teal-700">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          {/* Copy */}
          <div>
            <p className="text-teal-200 text-sm font-semibold uppercase tracking-wide mb-3">
              Guía gratuita
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              5 pasos para volver a entrenar después de una lesión
            </h2>
            <p className="text-teal-100 mb-6">
              Lo que necesitas saber antes de volver a cargar — sin recaídas, sin
              miedo y sin perder más tiempo con tratamientos que no van al fondo
              del problema.
            </p>
            <ul className="space-y-2 text-sm text-teal-100">
              <li className="flex gap-2">
                <span className="text-white">→</span>
                Por qué el dolor vuelve y cómo identificar la causa real
              </li>
              <li className="flex gap-2">
                <span className="text-white">→</span>
                El error que comete el 80% de los deportistas al volver
              </li>
              <li className="flex gap-2">
                <span className="text-white">→</span>
                Cómo progresar la carga semana a semana sin adivinar
              </li>
            </ul>
          </div>

          {/* Formulario */}
          <div className="rounded-2xl bg-white p-6 md:p-8">
            <p className="text-sm font-semibold text-slate-900 mb-4">
              Recibe la guía gratis en tu email
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="lead-name"
                  className="block text-sm text-slate-600 mb-1"
                >
                  Tu nombre
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  placeholder="Ej: Sebastián"
                />
              </div>
              <div>
                <label
                  htmlFor="lead-email"
                  className="block text-sm text-slate-600 mb-1"
                >
                  Tu email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  placeholder="tu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Enviando..." : "Quiero la guía"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600">
                  No pudimos enviar la guía. Intenta de nuevo.
                </p>
              )}
            </form>
            <p className="mt-4 text-xs text-slate-400">
              Solo usamos tu email para enviarte la guía. Sin spam.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
