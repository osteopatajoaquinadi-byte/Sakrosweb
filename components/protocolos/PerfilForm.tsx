"use client";

import { useEffect, useRef, useState } from "react";
import type { PerfilProfesional } from "@/lib/protocolos/types";
import { imagenADataUrl } from "./storage";

interface Props {
  perfil: PerfilProfesional;
  onGuardar: (p: PerfilProfesional) => boolean;
  onCerrar: () => void;
}

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none";

export default function PerfilForm({ perfil, onGuardar, onCerrar }: Props) {
  const [form, setForm] = useState(perfil);
  const [msg, setMsg] = useState("");
  const [dibujando, setDibujando] = useState(false);


  async function subir(campo: "logo" | "firma", file?: File) {
    if (!file) return;
    try {
      const data = await imagenADataUrl(file, campo === "logo" ? 600 : 500);
      setForm((f) => ({ ...f, [campo]: data }));
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const ok = onGuardar(form);
    setMsg(ok ? "Perfil guardado en este dispositivo." : "No se pudo guardar: prueba con imágenes más livianas.");
  }

  return (
    <form onSubmit={guardar} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mi perfil profesional</h2>
          <p className="text-sm text-slate-500">
            Aparece en el encabezado y en la firma de cada plan en PDF. Se guarda solo en este dispositivo.
          </p>
        </div>
        <button type="button" onClick={onCerrar} className="text-sm text-slate-500 hover:text-slate-800">
          Cerrar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-600">Nombre</span>
          <input className={INPUT} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej.: Joaquín Adi" />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Profesión</span>
          <input className={INPUT} value={form.profesion} onChange={(e) => setForm({ ...form, profesion: e.target.value })} placeholder="Kinesiólogo · Osteópata" />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">N° de registro (Superintendencia de Salud)</span>
          <input className={INPUT} value={form.registro} onChange={(e) => setForm({ ...form, registro: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Centro o consulta</span>
          <input className={INPUT} value={form.centro} onChange={(e) => setForm({ ...form, centro: e.target.value })} placeholder="Clínica Sakros, Viña del Mar" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Contacto (teléfono, correo o web)</span>
          <input className={INPUT} value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoImagen
          titulo="Logo"
          ayuda="PNG con fondo transparente o JPG."
          valor={form.logo}
          onArchivo={(f) => subir("logo", f)}
          onQuitar={() => setForm({ ...form, logo: null })}
        />
        <div>
          <CampoImagen
            titulo="Firma"
            ayuda="Sube una foto de tu firma o dibújala."
            valor={form.firma}
            onArchivo={(f) => subir("firma", f)}
            onQuitar={() => setForm({ ...form, firma: null })}
          />
          <button type="button" onClick={() => setDibujando(true)} className="mt-2 text-sm font-semibold text-teal-700 hover:underline">
            Dibujar firma
          </button>
        </div>
      </div>

      {dibujando && (
        <PadFirma
          onListo={(data) => {
            setForm((f) => ({ ...f, firma: data }));
            setDibujando(false);
          }}
          onCancelar={() => setDibujando(false)}
        />
      )}

      {msg && <p className="text-sm text-slate-700">{msg}</p>}
      <button type="submit" className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
        Guardar perfil
      </button>
    </form>
  );
}

function CampoImagen({
  titulo,
  ayuda,
  valor,
  onArchivo,
  onQuitar,
}: {
  titulo: string;
  ayuda: string;
  valor: string | null;
  onArchivo: (f?: File) => void;
  onQuitar: () => void;
}) {
  return (
    <div className="text-sm">
      <span className="text-slate-600">{titulo}</span>
      <div className="mt-1 flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {valor ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={valor} alt={titulo} className="max-h-24 max-w-[90%] object-contain" />
        ) : (
          <span className="text-xs text-slate-400">{ayuda}</span>
        )}
      </div>
      <div className="mt-2 flex gap-3">
        <label className="cursor-pointer font-semibold text-teal-700 hover:underline">
          {valor ? "Cambiar" : "Subir imagen"}
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onArchivo(e.target.files?.[0])} />
        </label>
        {valor && (
          <button type="button" onClick={onQuitar} className="text-slate-500 hover:text-red-600">
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}

function PadFirma({ onListo, onCancelar }: { onListo: (data: string) => void; onCancelar: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [vacio, setVacio] = useState(true);

  useEffect(() => {
    const c = ref.current!;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-sm text-slate-600">Firma con el dedo o el mouse:</p>
      <canvas
        ref={ref}
        className="h-40 w-full touch-none rounded-lg border border-slate-300 bg-white"
        onPointerDown={(e) => {
          dibujando.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = e.currentTarget.getContext("2d")!;
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!dibujando.current) return;
          const ctx = e.currentTarget.getContext("2d")!;
          const p = pos(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          setVacio(false);
        }}
        onPointerUp={() => (dibujando.current = false)}
      />
      <div className="mt-3 flex gap-4 text-sm">
        <button
          type="button"
          disabled={vacio}
          onClick={() => onListo(ref.current!.toDataURL("image/png"))}
          className="rounded-full bg-teal-700 px-4 py-1.5 font-semibold text-white disabled:opacity-40"
        >
          Usar esta firma
        </button>
        <button
          type="button"
          onClick={() => {
            const c = ref.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            setVacio(true);
          }}
          className="text-slate-600 hover:text-slate-900"
        >
          Borrar
        </button>
        <button type="button" onClick={onCancelar} className="text-slate-500 hover:text-red-600">
          Cancelar
        </button>
      </div>
    </div>
  );
}
