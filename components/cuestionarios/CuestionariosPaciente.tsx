"use client";

import { useCallback, useEffect, useState } from "react";
import FormularioTHI from "./FormularioTHI";
import {
  THI_MAX_SUBESCALA,
  THI_OPCIONES,
  THI_PREGUNTAS,
  THI_SUBESCALAS,
  type RespuestaTHI,
  type Subescala,
} from "@/lib/cuestionarios/thi";

type Cuestionario = {
  id: string;
  tipo: string;
  estado: "pendiente" | "respondido";
  origen: "profesional" | "paciente";
  respuestas: Record<string, RespuestaTHI> | null;
  puntaje: number | null;
  severidad: string | null;
  subescalas: Record<Subescala, number> | null;
  expira_at: string | null;
  creado_por: string | null;
  created_at: string;
  respondido_at: string | null;
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });

const COLOR_SEVERIDAD: Record<string, string> = {
  Leve: "bg-emerald-100 text-emerald-800",
  Mediano: "bg-lime-100 text-lime-800",
  Moderado: "bg-amber-100 text-amber-800",
  Severo: "bg-orange-100 text-orange-800",
  Catastrófico: "bg-red-100 text-red-800",
};

// Pestaña "Cuestionarios" de la ficha: THI completado en la consulta o
// enviado al paciente para que lo responda desde su casa.
export default function CuestionariosPaciente({ patientId, email }: { patientId: string; email: string | null }) {
  const [lista, setLista] = useState<Cuestionario[] | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [enviandoLink, setEnviandoLink] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const cargar = useCallback(() => {
    fetch(`/api/fichas/patients/${patientId}/cuestionarios`)
      .then((r) => r.json())
      .then((d) => setLista(d.cuestionarios ?? []))
      .catch(() => setLista([]));
  }, [patientId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar(respuestas: Record<string, RespuestaTHI>) {
    setGuardando(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/fichas/patients/${patientId}/cuestionarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "THI", respuestas }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setMsg({ ok: false, text: d.error || "No se pudo guardar." });
      else {
        setMsg({ ok: true, text: `THI guardado: ${d.puntaje} puntos (${d.severidad}).` });
        setNuevo(false);
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  }

  async function enviarLink() {
    if (!email) return;
    if (!confirm(`¿Enviar el cuestionario THI a ${email}?`)) return;
    setEnviandoLink(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/fichas/patients/${patientId}/cuestionarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "THI", enviar: true }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setMsg({ ok: false, text: d.error || "No se pudo enviar." });
      else {
        setMsg({ ok: true, text: `Enviado a ${d.to}. Cuando lo responda, el resultado aparece aquí.` });
        cargar();
      }
    } finally {
      setEnviandoLink(false);
    }
  }

  async function eliminar(c: Cuestionario) {
    if (!confirm(c.estado === "pendiente" ? "¿Anular este envío? El link dejará de funcionar." : "¿Eliminar este resultado?")) return;
    await fetch(`/api/fichas/patients/${patientId}/cuestionarios?cid=${c.id}`, { method: "DELETE" });
    cargar();
  }

  const respondidos = (lista ?? []).filter((c) => c.estado === "respondido");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Cuestionario THI (tinnitus)</h3>
        {!nuevo && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={enviarLink}
              disabled={!email || enviandoLink}
              title={email ? "" : "El paciente no tiene correo en su ficha"}
              className="rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40"
            >
              {enviandoLink ? "Enviando…" : "✉ Enviar al paciente"}
            </button>
            <button
              onClick={() => { setNuevo(true); setMsg(null); }}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              + Completar ahora
            </button>
          </div>
        )}
      </div>
      {!email && <p className="mb-3 text-xs text-slate-500">Para enviarlo al paciente, agrega su correo con Editar.</p>}
      {msg && <p className={`mb-3 text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}

      {nuevo && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-slate-900">Nuevo THI</p>
            <button onClick={() => setNuevo(false)} className="text-sm text-slate-500 hover:text-teal-700">Cancelar</button>
          </div>
          <FormularioTHI onEnviar={guardar} enviando={guardando} mostrarPuntaje textoBoton="Guardar THI" />
        </div>
      )}

      {/* Evolución */}
      {respondidos.length > 1 && (
        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
          Evolución:{" "}
          {[...respondidos].reverse().map((c, i, arr) => (
            <span key={c.id}>
              <strong>{c.puntaje}</strong> <span className="text-xs text-teal-700">({fecha(c.respondido_at ?? c.created_at)})</span>
              {i < arr.length - 1 && " → "}
            </span>
          ))}
          {(() => {
            const primero = respondidos[respondidos.length - 1].puntaje ?? 0;
            const ultimo = respondidos[0].puntaje ?? 0;
            const dif = ultimo - primero;
            return (
              <span className="ml-2 font-semibold">
                {dif === 0 ? "· sin cambio" : dif < 0 ? `· bajó ${-dif} puntos` : `· subió ${dif} puntos`}
              </span>
            );
          })()}
        </div>
      )}

      {lista === null ? (
        <p className="py-6 text-center text-slate-400">Cargando…</p>
      ) : lista.length === 0 ? (
        <p className="py-6 text-center text-slate-400">Sin cuestionarios todavía.</p>
      ) : (
        <div className="space-y-3">
          {lista.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {c.estado === "respondido" ? (
                    <>
                      <span className="text-lg font-bold text-slate-900">{c.puntaje}<span className="text-xs font-normal text-slate-400">/100</span></span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLOR_SEVERIDAD[c.severidad ?? ""] ?? "bg-slate-100 text-slate-700"}`}>
                        {c.severidad}
                      </span>
                    </>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      Esperando respuesta del paciente
                      {c.expira_at && new Date(c.expira_at) < new Date() ? " · link vencido" : ""}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {c.estado === "respondido"
                    ? `${fecha(c.respondido_at ?? c.created_at)} · ${c.origen === "paciente" ? "respondido por el paciente" : `en consulta (${c.creado_por ?? ""})`}`
                    : `enviado el ${fecha(c.created_at)} por ${c.creado_por ?? ""}`}
                </span>
              </div>

              {c.estado === "respondido" && c.subescalas && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {(Object.keys(THI_SUBESCALAS) as Subescala[]).map((k) => (
                    <span key={k}>
                      {THI_SUBESCALAS[k]}: <strong>{c.subescalas![k]}</strong>/{THI_MAX_SUBESCALA[k]}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2 flex gap-3 text-xs font-semibold">
                {c.estado === "respondido" && c.respuestas && (
                  <button onClick={() => setAbierto(abierto === c.id ? null : c.id)} className="text-teal-700 hover:underline">
                    {abierto === c.id ? "Ocultar respuestas" : "Ver respuestas"}
                  </button>
                )}
                <button onClick={() => eliminar(c)} className="text-red-600 hover:underline">
                  {c.estado === "pendiente" ? "Anular envío" : "Eliminar"}
                </button>
              </div>

              {abierto === c.id && c.respuestas && (
                <ol className="mt-3 space-y-1 text-xs text-slate-700">
                  {THI_PREGUNTAS.map((p) => {
                    const v = c.respuestas![String(p.n)];
                    const o = THI_OPCIONES.find((x) => x.value === v);
                    return (
                      <li key={p.n} className="flex justify-between gap-3 border-b border-slate-100 pb-1">
                        <span><span className="text-slate-400">{p.n}. ({p.tipo})</span> {p.texto}</span>
                        <strong className={v === "si" ? "text-red-700" : v === "a_veces" ? "text-amber-700" : "text-slate-500"}>
                          {o?.label ?? "—"}
                        </strong>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
