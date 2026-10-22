"use client";

import { useState } from "react";
import {
  THI_OPCIONES,
  THI_PREGUNTAS,
  puntuarTHI,
  type RespuestaTHI,
} from "@/lib/cuestionarios/thi";

// Formulario THI: lo usa el profesional en la ficha y el paciente desde su link.
export default function FormularioTHI({
  onEnviar,
  enviando,
  mostrarPuntaje = false,
  textoBoton = "Guardar",
}: {
  onEnviar: (respuestas: Record<string, RespuestaTHI>) => void;
  enviando: boolean;
  mostrarPuntaje?: boolean;
  textoBoton?: string;
}) {
  const [resp, setResp] = useState<Record<string, RespuestaTHI>>({});
  const respondidas = Object.keys(resp).length;
  const total = THI_PREGUNTAS.length;
  const completo = respondidas === total;
  const parcial = puntuarTHI(resp);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) {
      const falta = THI_PREGUNTAS.find((p) => !resp[String(p.n)]);
      if (falta) document.getElementById(`thi-${falta.n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onEnviar(resp);
  }

  return (
    <form onSubmit={enviar}>
      <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        Responde cada pregunta según el zumbido o ruido en el oído:
        <span className="block mt-1">
          <strong>Sí</strong>: es permanente · <strong>A veces</strong>: en algunas ocasiones · <strong>No</strong>: no le pasa.
        </span>
      </div>

      <ol className="space-y-3">
        {THI_PREGUNTAS.map((p) => {
          const v = resp[String(p.n)];
          return (
            <li key={p.n} id={`thi-${p.n}`} className={`rounded-xl border p-3 ${v ? "border-slate-200 bg-white" : "border-slate-200 bg-white"}`}>
              <p className="mb-2 text-sm font-medium text-slate-900">
                <span className="mr-1 text-slate-400">{p.n}.</span> {p.texto}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {THI_OPCIONES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setResp({ ...resp, [String(p.n)]: o.value })}
                    className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                      v === o.value
                        ? "border-teal-700 bg-teal-700 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-teal-700"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 py-3 backdrop-blur">
        <span className="text-sm text-slate-600">
          {respondidas} de {total} respondidas
          {mostrarPuntaje && respondidas > 0 && (
            <>
              {" · "}Puntaje: <strong>{parcial.puntaje}</strong>
              {completo && <> · <strong>{parcial.severidad}</strong></>}
            </>
          )}
        </span>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {enviando ? "Guardando…" : completo ? textoBoton : `Faltan ${total - respondidas}`}
        </button>
      </div>
    </form>
  );
}
