"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Adjunto = {
  id: string;
  nombre: string;
  tipo: string | null;
  tamano: number | null;
  origen: "subido" | "drive";
  subido_por: string | null;
  created_at: string;
  enlace: string | null;
};

const MAX = 50 * 1024 * 1024;
const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none";

function icono(a: Adjunto) {
  if (a.origen === "drive") return "🟢";
  if (a.tipo?.startsWith("image/")) return "🖼️";
  if (a.tipo === "application/pdf") return "📄";
  return "📎";
}
function peso(b: number | null) {
  if (!b) return "";
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

// Archivos de la ficha: fichas antiguas, exámenes, informes, fotos o enlaces de Drive.
export default function AdjuntosPaciente({ patientId }: { patientId: string }) {
  const [lista, setLista] = useState<Adjunto[] | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [enlace, setEnlace] = useState({ abierto: false, nombre: "", url: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const api = `/api/fichas/patients/${patientId}/adjuntos`;

  const cargar = useCallback(() => {
    fetch(api)
      .then((r) => r.json())
      .then((d) => setLista(d.adjuntos ?? []))
      .catch(() => setLista([]));
  }, [api]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  async function post(body: unknown) {
    const r = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "Error.");
    return d;
  }

  async function subir(files: FileList | File[]) {
    setMsg(null);
    const arr = Array.from(files);
    let ok = 0;
    for (const f of arr) {
      if (f.size > MAX) {
        setMsg({ ok: false, text: `"${f.name}" supera los 50 MB.` });
        continue;
      }
      setSubiendo(f.name);
      try {
        const { path, token } = await post({ accion: "preparar", nombre: f.name, tamano: f.size, tipo: f.type });
        const { error } = await getSupabase().storage.from("fichas-adjuntos").uploadToSignedUrl(path, token, f, {
          contentType: f.type || "application/octet-stream",
        });
        if (error) throw new Error("No se pudo subir el archivo.");
        await post({ accion: "confirmar", path, nombre: f.name, tamano: f.size, tipo: f.type });
        ok++;
      } catch (e) {
        setMsg({ ok: false, text: `${f.name}: ${(e as Error).message}` });
      }
    }
    setSubiendo(null);
    if (ok) setMsg({ ok: true, text: ok === 1 ? "Archivo subido." : `${ok} archivos subidos.` });
    if (fileRef.current) fileRef.current.value = "";
    cargar();
  }

  async function guardarEnlace(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await post({ accion: "enlace", nombre: enlace.nombre, url: enlace.url });
      setEnlace({ abierto: false, nombre: "", url: "" });
      cargar();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  async function eliminar(a: Adjunto) {
    if (!confirm(`¿Eliminar "${a.nombre}"?`)) return;
    await fetch(`${api}?aid=${a.id}`, { method: "DELETE" });
    cargar();
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Archivos adjuntos</h3>
        <button type="button" onClick={() => setEnlace({ ...enlace, abierto: !enlace.abierto })}
          className="text-sm font-semibold text-teal-700 hover:underline">
          {enlace.abierto ? "Cancelar" : "+ Agregar enlace (Drive)"}
        </button>
      </div>

      {enlace.abierto && (
        <form onSubmit={guardarEnlace} className="mb-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input required placeholder="Nombre (ej. Ficha 2024)" value={enlace.nombre} onChange={(e) => setEnlace({ ...enlace, nombre: e.target.value })} className={input} />
          <input required type="url" placeholder="https://drive.google.com/…" value={enlace.url} onChange={(e) => setEnlace({ ...enlace, url: e.target.value })} className={input} />
          <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Guardar</button>
        </form>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); if (e.dataTransfer.files.length) subir(e.dataTransfer.files); }}
        onClick={() => !subiendo && fileRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center text-sm transition ${arrastrando ? "border-teal-600 bg-teal-50" : "border-slate-300 hover:border-teal-600"}`}
      >
        {subiendo ? `Subiendo "${subiendo}"…` : <>Arrastra archivos aquí o <span className="font-semibold text-teal-700">elige desde tu equipo</span><br /><span className="text-xs text-slate-500">PDF, fotos, Word… hasta 50 MB cada uno</span></>}
        <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && subir(e.target.files)} />
      </div>
      {msg && <p className={`mt-2 text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}

      <div className="mt-3">
        {lista === null ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : lista.length === 0 ? (
          <p className="text-sm text-slate-400">Sin archivos todavía.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {lista.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <a href={a.enlace ?? "#"} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 hover:text-teal-700">
                  <span aria-hidden>{icono(a)}</span>
                  <span className="truncate font-medium text-slate-900">{a.nombre}</span>
                </a>
                <span className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                  <span className="hidden sm:inline">
                    {[a.origen === "drive" ? "Drive" : peso(a.tamano), new Date(a.created_at).toLocaleDateString("es-CL"), a.subido_por].filter(Boolean).join(" · ")}
                  </span>
                  <button type="button" onClick={() => eliminar(a)} className="font-semibold text-red-600 hover:underline">Eliminar</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
