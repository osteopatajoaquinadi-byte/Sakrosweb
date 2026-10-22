"use client";

import { useEffect, useState } from "react";
import FormularioTHI from "./FormularioTHI";
import type { RespuestaTHI } from "@/lib/cuestionarios/thi";
import { siteConfig } from "@/lib/site-config";

type Estado = { tipo: string; nombre: string; estado: "pendiente" | "respondido" | "vencido" };

// Página pública donde el paciente responde el cuestionario de su link.
export default function ResponderCuestionario({ token }: { token: string }) {
  const [info, setInfo] = useState<Estado | null>(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    fetch(`/api/cuestionario/${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) setError(d.error || "Link no válido.");
        else setInfo(d);
      })
      .catch(() => setError("Error de conexión. Intenta de nuevo."));
  }, [token]);

  async function enviar(respuestas: Record<string, RespuestaTHI>) {
    setEnviando(true);
    setError("");
    try {
      const r = await fetch(`/api/cuestionario/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setError(d.error || "No se pudo enviar.");
      else {
        setListo(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const contacto = (
    <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="font-semibold text-teal-700 underline">
      escríbenos por WhatsApp
    </a>
  );

  if (listo || info?.estado === "respondido") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">¡Gracias{info?.nombre ? `, ${info.nombre}` : ""}!</h1>
        <p className="mt-2 text-slate-700">Recibimos tus respuestas. Las revisaremos en tu próxima sesión.</p>
      </div>
    );
  }
  if (info?.estado === "vencido") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-slate-700">
        <h1 className="text-xl font-bold text-slate-900">Este link venció</h1>
        <p className="mt-2">Si necesitas uno nuevo, {contacto}.</p>
      </div>
    );
  }
  if (!info) {
    return error ? (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-700">
        <h1 className="text-xl font-bold text-slate-900">{error}</h1>
        <p className="mt-2">Revisa que abriste el link completo del correo o {contacto}.</p>
      </div>
    ) : (
      <p className="text-center text-slate-500">Cargando…</p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Inventario de Incapacidad de Tinnitus (THI)</h1>
      <p className="mt-2 mb-6 text-slate-600">
        {info.nombre ? `Hola ${info.nombre}, este` : "Este"} cuestionario busca identificar las dificultades que puede estar
        experimentando debido a su acúfeno o tinnitus. Son 25 preguntas y toma unos 5 minutos.
      </p>
      <FormularioTHI onEnviar={enviar} enviando={enviando} textoBoton="Enviar respuestas" />
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
