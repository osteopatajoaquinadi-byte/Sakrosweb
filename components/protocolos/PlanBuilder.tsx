"use client";

import { useEffect, useMemo, useState } from "react";
import { EJERCICIOS, REGIONES, getEjercicio } from "@/lib/protocolos/ejercicios";
import type { ItemPlan, PerfilProfesional } from "@/lib/protocolos/types";
import FichaEjercicio from "./FichaEjercicio";
import { cargarImagenes, generarPlanPdf, nombreArchivo } from "./pdf-plan";
import type { BorradorPlan } from "./storage";

interface Props {
  plan: BorradorPlan;
  perfil: PerfilProfesional;
  onCambiar: (p: BorradorPlan) => void;
  onAgregar: (ejercicioId: string, dosis: string, fase: string) => void;
  onEditarPerfil: () => void;
  onVolver: () => void;
}

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none";

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PlanBuilder({ plan, perfil, onCambiar, onAgregar, onEditarPerfil, onVolver }: Props) {
  const [buscar, setBuscar] = useState("");
  const [region, setRegion] = useState<string>("todas");
  const [biblioteca, setBiblioteca] = useState(plan.items.length === 0);
  const [msg, setMsg] = useState("");
  const [creando, setCreando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enPlan = useMemo(() => new Set(plan.items.map((i) => i.ejercicioId)), [plan.items]);
  const filtrados = useMemo(() => {
    const q = buscar.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return EJERCICIOS.filter(
      (e) =>
        (region === "todas" || e.region === region) &&
        (!q || `${e.nombre} ${e.en} ${e.descripcion}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q)),
    );
  }, [buscar, region]);

  function editarItem(uid: string, cambios: Partial<ItemPlan>) {
    onCambiar({ ...plan, items: plan.items.map((i) => (i.uid === uid ? { ...i, ...cambios } : i)) });
  }
  function mover(idx: number, dir: -1 | 1) {
    const items = [...plan.items];
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    [items[idx], items[j]] = [items[j], items[idx]];
    onCambiar({ ...plan, items });
  }
  function quitar(uid: string) {
    onCambiar({ ...plan, items: plan.items.filter((i) => i.uid !== uid) });
  }

  const perfilIncompleto = !perfil.nombre || !perfil.firma;

  function datosPdf() {
    return { paciente: plan.paciente.trim(), fecha: hoy(), protocolo: plan.protocolo, indicaciones: plan.indicaciones, items: plan.items };
  }

  async function crearPdf() {
    const datos = datosPdf();
    const doc = generarPlanPdf(datos, perfil, await cargarImagenes(datos.items));
    return { doc, datos };
  }

  async function descargar() {
    setCreando(true);
    const { doc, datos } = await crearPdf();
    doc.save(nombreArchivo(datos));
    setCreando(false);
  }

  // Envía el PDF adjunto al correo del paciente (sin descargarlo).
  async function enviarCorreo() {
    setMsg("");
    const to = (plan.pacienteEmail ?? "").trim();
    if (!to) {
      setMsg("Falta el correo del paciente: búscalo en las fichas o escríbelo arriba.");
      return;
    }
    setEnviando(true);
    try {
      const { doc, datos } = await crearPdf();
      const pdf = doc.output("datauristring").split(",")[1];
      if (pdf.length > 4_200_000) {
        setMsg("El PDF es demasiado grande para enviarlo por correo (muchas fotos). Descárgalo y adjúntalo a mano, o quita algunos ejercicios.");
        return;
      }
      const res = await fetch("/api/protocolos/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, paciente: datos.paciente, filename: nombreArchivo(datos), pdf }),
      });
      const d = await res.json().catch(() => ({}));
      setMsg(res.ok ? `Plan enviado a ${to}.` : d.error || "No se pudo enviar el correo.");
    } catch {
      setMsg("Error de conexión al enviar el correo.");
    } finally {
      setEnviando(false);
    }
  }

  // WhatsApp: desde el celular se abre la hoja de compartir con el PDF
  // adjunto. En computador todavía no hay envío directo (requiere la API de
  // WhatsApp Business), así que no se descarga nada.
  async function enviarWhatsapp() {
    setMsg("");
    setCreando(true);
    const { doc, datos } = await crearPdf();
    setCreando(false);
    const file = new File([doc.output("blob")], nombreArchivo(datos), { type: "application/pdf" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Plan de ejercicios" });
      } catch {
        /* el usuario canceló */
      }
    } else {
      setMsg("El envío directo por WhatsApp estará disponible pronto. Por ahora funciona desde el celular: abre el panel en tu teléfono y este botón te deja elegir WhatsApp con el PDF adjunto.");
    }
  }

  // Búsqueda de pacientes en las fichas para completar nombre y correo.
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [sugerencias, setSugerencias] = useState<{ id: string; name: string; email: string | null; phone: string | null }[]>([]);
  useEffect(() => {
    const q = buscarPaciente.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => {
      fetch(`/api/fichas/patients?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { patients: [] }))
        .then((d) => setSugerencias((d.patients ?? []).slice(0, 8)))
        .catch(() => setSugerencias([]));
    }, 250);
    return () => clearTimeout(t);
  }, [buscarPaciente]);
  const visibles = buscarPaciente.trim().length >= 2 ? sugerencias : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onVolver} className="text-sm text-slate-500 hover:text-teal-700">
          ← Volver
        </button>
        {plan.items.length > 0 && (
          <button
            onClick={() => window.confirm("¿Vaciar el plan actual?") && onCambiar({ paciente: "", pacienteEmail: "", pacienteTelefono: "", protocolo: "", indicaciones: "", items: [] })}
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Vaciar plan
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-slate-900">Plan para el paciente</h2>

      {perfilIncompleto && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>Completa tu perfil (nombre, logo y firma) para que el PDF salga firmado.</span>
          <button onClick={onEditarPerfil} className="font-semibold underline">
            Completar perfil
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative text-sm sm:col-span-2">
          <span className="text-slate-600">Buscar paciente en las fichas</span>
          <input
            className={INPUT}
            value={buscarPaciente}
            onChange={(e) => setBuscarPaciente(e.target.value)}
            placeholder="Nombre, RUT o correo…"
          />
          {visibles.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {visibles.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onCambiar({ ...plan, paciente: p.name, pacienteEmail: p.email ?? "", pacienteTelefono: p.phone ?? "" });
                      setBuscarPaciente("");
                      setSugerencias([]);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-teal-50"
                  >
                    <span className="font-medium text-slate-900">{p.name}</span>
                    {p.email && <span className="ml-2 text-xs text-slate-500">{p.email}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="text-sm">
          <span className="text-slate-600">Nombre del paciente</span>
          <input className={INPUT} value={plan.paciente} onChange={(e) => onCambiar({ ...plan, paciente: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Correo del paciente</span>
          <input
            type="email"
            className={INPUT}
            value={plan.pacienteEmail ?? ""}
            onChange={(e) => onCambiar({ ...plan, pacienteEmail: e.target.value })}
            placeholder="Para enviarle el PDF"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Protocolo de referencia</span>
          <input className={INPUT} value={plan.protocolo} onChange={(e) => onCambiar({ ...plan, protocolo: e.target.value })} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Indicaciones generales (frecuencia, progresión, recomendaciones)</span>
          <textarea
            rows={3}
            className={INPUT}
            value={plan.indicaciones}
            onChange={(e) => onCambiar({ ...plan, indicaciones: e.target.value })}
            placeholder="Ej.: realizar 3 veces por semana en días alternos. Control en 2 semanas."
          />
        </label>
      </div>

      {/* ── Ejercicios del plan ── */}
      <section>
        <p className="mb-2 text-sm font-semibold text-slate-900">Ejercicios ({plan.items.length})</p>
        {plan.items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Agrega ejercicios desde un protocolo o desde la biblioteca.
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.items.map((it, idx) => (
              <li key={it.uid} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {getEjercicio(it.ejercicioId)?.imagenes?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getEjercicio(it.ejercicioId)!.imagenes![0]} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {idx + 1}. {it.nombre}
                      </p>
                      {it.fase && <p className="text-xs text-teal-700">{it.fase}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 text-slate-400">
                    <button onClick={() => mover(idx, -1)} className="px-1.5 hover:text-slate-700" aria-label="Subir">
                      ↑
                    </button>
                    <button onClick={() => mover(idx, 1)} className="px-1.5 hover:text-slate-700" aria-label="Bajar">
                      ↓
                    </button>
                    <button onClick={() => quitar(it.uid)} className="px-1.5 hover:text-red-600" aria-label="Quitar">
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input className={INPUT} value={it.dosis} onChange={(e) => editarItem(it.uid, { dosis: e.target.value })} placeholder="Dosis" />
                  <input className={INPUT} value={it.notas} onChange={(e) => editarItem(it.uid, { notas: e.target.value })} placeholder="Nota para el paciente (opcional)" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Biblioteca ── */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <button onClick={() => setBiblioteca(!biblioteca)} className="flex w-full items-center justify-between px-5 py-4 text-left">
          <span className="font-semibold text-slate-900">Biblioteca de ejercicios ({EJERCICIOS.length}, con instrucciones paso a paso)</span>
          <span className="text-slate-400">{biblioteca ? "−" : "+"}</span>
        </button>
        {biblioteca && (
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            <input className={INPUT} value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar ejercicio..." />
            <div className="flex flex-wrap gap-1.5">
              {[{ id: "todas", label: "Todas" }, ...REGIONES].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    region === r.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <ul className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
              {filtrados.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <FichaEjercicio ejercicio={e} />
                  <button
                    disabled={enPlan.has(e.id)}
                    onClick={() => onAgregar(e.id, e.dosis, "")}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      enPlan.has(e.id) ? "bg-slate-100 text-slate-400" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    }`}
                  >
                    {enPlan.has(e.id) ? "En el plan" : "+ Agregar"}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400">
              Los enlaces de ExRx, HEP2go y Rehab Hero abren una búsqueda del ejercicio en esos sitios. Su contenido tiene derechos de sus autores y no se copia al PDF. Las fotos incluidas son de free-exercise-db (dominio público).
            </p>
          </div>
        )}
      </section>

      <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <button
          onClick={descargar}
          disabled={plan.items.length === 0 || creando}
          className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
        >
          {creando ? "Preparando PDF…" : "Descargar PDF"}
        </button>
        <button
          onClick={enviarCorreo}
          disabled={plan.items.length === 0 || creando || enviando}
          className="rounded-full border border-teal-700 px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40"
        >
          {enviando ? "Enviando…" : plan.pacienteEmail ? `Enviar por correo a ${plan.pacienteEmail}` : "Enviar por correo"}
        </button>
        <button
          onClick={enviarWhatsapp}
          disabled={plan.items.length === 0 || creando || enviando}
          className="rounded-full border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
          title="Desde el celular abre WhatsApp con el PDF adjunto"
        >
          WhatsApp
        </button>
        {msg && <p className="w-full text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  );
}
