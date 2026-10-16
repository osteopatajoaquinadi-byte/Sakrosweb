"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const DOLOR_OPTIONS = [
  "Espalda / zona lumbar",
  "Cuello / cervical",
  "Cefaleas o migrañas",
  "Hombro, codo o muñeca",
  "Cadera, rodilla o tobillo",
  "Problemas digestivos",
  "Mal dormir o fatiga crónica",
  "Otro",
];

const DURACION_OPTIONS = [
  "Menos de 1 mes",
  "1 a 3 meses",
  "3 a 6 meses",
  "Más de 6 meses",
  "Años",
];

const DEPORTE_OPTIONS = [
  "Sí, entreno regularmente",
  "Sí, pero con dolor o miedo",
  "Quiero volver pero no puedo",
  "No hago deporte",
];

type Props = {
  servicio?: string;
};

export default function CampaignLeadForm({ servicio = "osteopatia" }: Props) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    dolor: "",
    duracion: "",
    hace_deporte: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/campaign-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          servicio,
          utm_source: searchParams.get("utm_source") || undefined,
          utm_medium: searchParams.get("utm_medium") || undefined,
          utm_campaign: searchParams.get("utm_campaign") || undefined,
          utm_content: searchParams.get("utm_content") || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      setStatus("success");

      // Redirigir a WhatsApp con mensaje contextual después de 2s
      const phone = form.whatsapp.replace(/\D/g, "");
      const fullPhone = phone.startsWith("56") ? phone : `56${phone}`;
      const msg = encodeURIComponent(
        `Hola, soy ${form.nombre}. Acabo de completar el formulario en la web. ` +
        `Tengo ${form.dolor.toLowerCase()} hace ${form.duracion.toLowerCase()}. ` +
        `Me gustaría agendar una evaluación.`
      );
      setTimeout(() => {
        window.open(`https://wa.me/${fullPhone.replace(fullPhone, "56945399692")}?text=${msg}`, "_blank");
      }, 2500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error al enviar. Intenta de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-teal-50 border border-teal-200 p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-xl font-bold text-teal-900 mb-2">
          Recibimos tu información, {form.nombre.split(" ")[0]}
        </h3>
        <p className="text-teal-800 mb-4">
          Te estamos redirigiendo a WhatsApp para confirmar tu evaluación.
          Si no se abre automáticamente, escríbenos al{" "}
          <a
            href="https://wa.me/56945399692"
            className="underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            +56 9 4539 9692
          </a>
        </p>
        <p className="text-sm text-teal-700">
          También te contactaremos nosotros dentro de las próximas horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          value={form.nombre}
          onChange={handleChange}
          placeholder="Tu nombre"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 mb-1">
          WhatsApp
        </label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
            +56
          </span>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            required
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="9 1234 5678"
            className="w-full rounded-r-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>

      {/* Dolor */}
      <div>
        <label htmlFor="dolor" className="block text-sm font-medium text-slate-700 mb-1">
          ¿Qué te duele o molesta?
        </label>
        <select
          id="dolor"
          name="dolor"
          required
          value={form.dolor}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none appearance-none bg-white"
        >
          <option value="" disabled>Selecciona una opción</option>
          {DOLOR_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Duración */}
      <div>
        <label htmlFor="duracion" className="block text-sm font-medium text-slate-700 mb-1">
          ¿Hace cuánto tiempo?
        </label>
        <select
          id="duracion"
          name="duracion"
          required
          value={form.duracion}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none appearance-none bg-white"
        >
          <option value="" disabled>Selecciona una opción</option>
          {DURACION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Deporte */}
      <div>
        <label htmlFor="hace_deporte" className="block text-sm font-medium text-slate-700 mb-1">
          ¿Haces deporte actualmente?
        </label>
        <select
          id="hace_deporte"
          name="hace_deporte"
          required
          value={form.hace_deporte}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none appearance-none bg-white"
        >
          <option value="" disabled>Selecciona una opción</option>
          {DEPORTE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-teal-700 py-4 text-base font-bold text-white hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {status === "sending" ? "Enviando..." : "Quiero mi evaluación"}
      </button>

      <p className="text-xs text-slate-500 text-center">
        Te contactaremos por WhatsApp para confirmar tu hora. Sin compromiso.
      </p>
    </form>
  );
}
