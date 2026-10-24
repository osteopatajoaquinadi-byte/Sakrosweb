"use client";

import { useEffect, useMemo, useState } from "react";
import { renderCampana, type ContenidoCampana } from "@/lib/campanas";

type Campana = {
  id: string;
  nombre: string;
  asunto: string;
  segmento: string;
  estado: string;
  programada_para: string | null;
  creado_por: string | null;
  created_at: string;
  contenido: ContenidoCampana;
};

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none";
const SITIO = "https://www.sakros.cl";
const ENLACES = [
  { url: `${SITIO}/reserva`, label: "Reservar hora" },
  { url: `${SITIO}/packs-tratamiento`, label: "Packs de tratamiento" },
  { url: `${SITIO}/servicios/osteopatia`, label: "Osteopatía" },
  { url: `${SITIO}/servicios/kinesiologia`, label: "Kinesiología" },
  { url: `${SITIO}/servicios/posturologia`, label: "Posturología" },
  { url: `${SITIO}/blog`, label: "Blog" },
];

const IDEAS = [
  { tipo: "Consejo del mes", idea: "Un consejo práctico de salud musculoesquelética para esta época del año." },
  { tipo: "Reactivar pacientes", idea: "Invitar a quienes no vienen hace tiempo a un control para ver cómo siguen." },
  { tipo: "Ejercicio para la casa", idea: "Un ejercicio simple y seguro para hacer en casa o en la oficina, explicado paso a paso." },
  { tipo: "Novedad de la clínica", idea: "" },
  { tipo: "Mito vs realidad", idea: "Desmentir un mito común sobre el dolor de espalda o cuello." },
  { tipo: "Artículo del blog", idea: "Invitar a leer el último artículo del blog con un resumen atractivo." },
];

const VACIO: ContenidoCampana = { asunto: "", preheader: "", titulo: "", cuerpo: "", imagen: "", ctaTexto: "Reservar hora", ctaUrl: `${SITIO}/reserva` };

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Campañas de correo para la lista de pacientes: redactar (con ayuda de IA),
// previsualizar, enviar una prueba y enviar o programar a una lista.
export default function CampanasTab({ nombreUsuario }: { nombreUsuario: string }) {
  const [c, setC] = useState<ContenidoCampana>(VACIO);
  const [nombre, setNombre] = useState("");
  const [segmento, setSegmento] = useState("todos");
  const [segmentos, setSegmentos] = useState<{ key: string; label: string }[]>([]);
  const [historial, setHistorial] = useState<Campana[]>([]);

  const [idea, setIdea] = useState("");
  const [tipo, setTipo] = useState("");
  const [tono, setTono] = useState("cercano");
  const [alternativas, setAlternativas] = useState<string[]>([]);
  const [generando, setGenerando] = useState(false);

  const [pruebaA, setPruebaA] = useState("sakrosvina@gmail.com");
  const [programar, setProgramar] = useState(false);
  const [cuando, setCuando] = useState("");
  const [movil, setMovil] = useState(true);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function cargar() {
    fetch("/api/equipo/campanas")
      .then((r) => r.json())
      .then((d) => {
        setHistorial(d.campanas ?? []);
        setSegmentos(d.segmentos ?? []);
      })
      .catch(() => {});
  }
  useEffect(cargar, []);

  const preview = useMemo(
    () => renderCampana({ ...c, imagen: c.imagen || undefined }, { nombre: nombreUsuario.split(" ")[0] || "Carla", bajaUrl: "#" }).html,
    [c, nombreUsuario],
  );

  async function redactar() {
    setGenerando(true);
    setMsg(null);
    try {
      const r = await fetch("/api/equipo/campanas/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, tipo, tono, segmento }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setMsg({ ok: false, text: d.error || "No se pudo generar." });
      const b = d.borrador;
      setC({ ...c, asunto: b.asunto, preheader: b.preheader, titulo: b.titulo, cuerpo: b.cuerpo, ctaTexto: b.ctaTexto, ctaUrl: b.ctaUrl });
      setAlternativas(b.alternativasAsunto ?? []);
      if (!nombre) setNombre(tipo || b.asunto);
      setMsg({ ok: true, text: "Borrador listo. Revísalo y ajústalo antes de enviar." });
    } finally {
      setGenerando(false);
    }
  }

  async function accion(tipoAccion: "prueba" | "enviar") {
    setMsg(null);
    const lista = segmentos.find((s) => s.key === segmento)?.label ?? segmento;
    if (tipoAccion === "enviar") {
      const texto = programar
        ? `¿Programar "${c.asunto}" para ${cuando ? fecha(new Date(cuando).toISOString()) : "?"} a: ${lista}?`
        : `¿Enviar AHORA "${c.asunto}" a: ${lista}? No se puede deshacer.`;
      if (!confirm(texto)) return;
    }
    setOcupado(tipoAccion);
    try {
      const r = await fetch("/api/equipo/campanas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: tipoAccion,
          contenido: c,
          to: pruebaA,
          segmento,
          nombre,
          programarPara: tipoAccion === "enviar" && programar && cuando ? new Date(cuando).toISOString() : undefined,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setMsg({ ok: false, text: d.error || "No se pudo enviar." });
      else if (tipoAccion === "prueba") setMsg({ ok: true, text: `Prueba enviada a ${pruebaA}.` });
      else {
        setMsg({ ok: true, text: d.programada ? "Campaña programada." : "¡Campaña enviada! Puede tardar unos minutos en llegar a todos." });
        setC(VACIO);
        setNombre("");
        setAlternativas([]);
        cargar();
      }
    } finally {
      setOcupado(null);
    }
  }

  const listo = c.asunto.trim() && c.titulo.trim() && c.cuerpo.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Campañas de correo</h2>
        <p className="text-sm text-slate-500">
          Escribe a tus pacientes con el diseño de Sakros. Cada correo incluye el enlace para darse de baja.
        </p>
      </div>

      {/* Asistente IA */}
      <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
        <h3 className="font-semibold text-slate-900">✨ Redactar con IA</h3>
        <p className="mb-3 text-sm text-slate-600">Elige una idea o escribe la tuya; la IA prepara asunto, texto y botón.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {IDEAS.map((i) => (
            <button key={i.tipo} type="button"
              onClick={() => { setTipo(i.tipo); if (i.idea) setIdea(i.idea); }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${tipo === i.tipo ? "border-teal-700 bg-teal-700 text-white" : "border-teal-300 bg-white text-teal-800 hover:border-teal-700"}`}>
              {i.tipo}
            </button>
          ))}
        </div>
        <textarea rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} className={input}
          placeholder="Ej: contarles que llegó Edison al equipo de kinesiología y que tiene horas los sábados" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select value={tono} onChange={(e) => setTono(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="cercano">Tono cercano</option>
            <option value="profesional">Tono profesional</option>
            <option value="motivador">Tono motivador</option>
            <option value="breve y directo">Breve y directo</option>
          </select>
          <button type="button" onClick={redactar} disabled={generando || (!idea.trim() && !tipo)}
            className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
            {generando ? "Redactando…" : "Redactar borrador"}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Enviar a
              <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className={`mt-1 ${input}`}>
                {segmentos.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Nombre interno
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Consejo octubre" className={`mt-1 ${input}`} />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">Asunto *
            <input value={c.asunto} onChange={(e) => setC({ ...c, asunto: e.target.value })} maxLength={150} className={`mt-1 ${input}`} />
          </label>
          {alternativas.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500">Otros asuntos:</span>
              {alternativas.map((a) => (
                <button key={a} type="button" onClick={() => setC({ ...c, asunto: a })} className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 hover:bg-teal-100">{a}</button>
              ))}
            </div>
          )}
          <label className="block text-sm font-medium text-slate-700">Texto de vista previa
            <input value={c.preheader} onChange={(e) => setC({ ...c, preheader: e.target.value })} maxLength={200}
              placeholder="Lo que se ve junto al asunto en la bandeja" className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Título *
            <input value={c.titulo} onChange={(e) => setC({ ...c, titulo: e.target.value })} className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Texto * <span className="font-normal text-slate-400">(línea en blanco = nuevo párrafo; el saludo con el nombre se agrega solo)</span>
            <textarea rows={10} value={c.cuerpo} onChange={(e) => setC({ ...c, cuerpo: e.target.value })} className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Imagen (opcional, enlace https)
            <input value={c.imagen ?? ""} onChange={(e) => setC({ ...c, imagen: e.target.value })} placeholder="https://www.sakros.cl/images/…" className={`mt-1 ${input}`} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Texto del botón
              <input value={c.ctaTexto ?? ""} onChange={(e) => setC({ ...c, ctaTexto: e.target.value })} className={`mt-1 ${input}`} />
            </label>
            <label className="text-sm font-medium text-slate-700">Enlace del botón
              <input list="enlaces-sakros" value={c.ctaUrl ?? ""} onChange={(e) => setC({ ...c, ctaUrl: e.target.value })} className={`mt-1 ${input}`} />
              <datalist id="enlaces-sakros">
                {ENLACES.map((e) => <option key={e.url} value={e.url}>{e.label}</option>)}
              </datalist>
            </label>
          </div>

          {/* Envío */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex-1 min-w-[200px] text-sm font-medium text-slate-700">Enviar prueba a
                <input type="email" value={pruebaA} onChange={(e) => setPruebaA(e.target.value)} className={`mt-1 ${input}`} />
              </label>
              <button type="button" onClick={() => accion("prueba")} disabled={!listo || !!ocupado}
                className="rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40">
                {ocupado === "prueba" ? "Enviando…" : "Enviar prueba"}
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={programar} onChange={(e) => setProgramar(e.target.checked)} />
              Programar para más tarde
            </label>
            {programar && (
              <input type="datetime-local" value={cuando} onChange={(e) => setCuando(e.target.value)} className={input} />
            )}
            <button type="button" onClick={() => accion("enviar")} disabled={!listo || !!ocupado || (programar && !cuando)}
              className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40">
              {ocupado === "enviar" ? "Enviando…" : programar ? "Programar campaña" : `Enviar a ${segmentos.find((s) => s.key === segmento)?.label ?? "la lista"}`}
            </button>
            <p className="text-xs text-slate-500">Recomendación: envía primero una prueba y revísala en tu celular.</p>
          </div>
          {msg && <p className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        </section>

        {/* Vista previa */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Vista previa</h3>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold">
              <button type="button" onClick={() => setMovil(true)} className={`rounded-full px-3 py-1 ${movil ? "bg-teal-700 text-white" : "text-slate-600"}`}>Celular</button>
              <button type="button" onClick={() => setMovil(false)} className={`rounded-full px-3 py-1 ${!movil ? "bg-teal-700 text-white" : "text-slate-600"}`}>Computador</button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-100 p-3">
            <div className="mb-2 rounded-lg bg-white px-3 py-2 text-xs">
              <p className="font-semibold text-slate-900 truncate">{c.asunto || "Asunto del correo"}</p>
              <p className="text-slate-500 truncate">{c.preheader || "Texto de vista previa"}</p>
            </div>
            <iframe title="Vista previa" srcDoc={preview} sandbox=""
              className={`mx-auto block h-[640px] rounded-lg border-0 bg-white ${movil ? "w-[375px] max-w-full" : "w-full"}`} />
          </div>
        </section>
      </div>

      {/* Historial */}
      <section>
        <h3 className="mb-2 font-semibold text-slate-900">Campañas enviadas</h3>
        {historial.length === 0 ? (
          <p className="text-sm text-slate-400">Todavía no hay campañas.</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {historial.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{h.asunto}</p>
                  <p className="text-xs text-slate-500">
                    {segmentos.find((s) => s.key === h.segmento)?.label ?? h.segmento} · {h.creado_por} ·{" "}
                    {h.estado === "programada" && h.programada_para ? `programada para ${fecha(h.programada_para)}` : fecha(h.created_at)}
                  </p>
                </div>
                <button type="button" onClick={() => { setC(h.contenido); setNombre(`${h.nombre} (copia)`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-xs font-semibold text-teal-700 hover:underline">
                  Reutilizar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
