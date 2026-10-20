"use client";

import { useState } from "react";

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none";
const MAX_ADJUNTO = 3_000_000;

// Redactar y enviar un correo al paciente desde su ficha.
export default function CorreoPaciente({
  patientId,
  email,
  nombre,
  onClose,
}: {
  patientId: string;
  email: string | null;
  nombre: string;
  onClose: () => void;
}) {
  const [asunto, setAsunto] = useState("Indicaciones de tu sesión");
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState("");

  if (!email) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {nombre} no tiene correo en su ficha. Agrégalo con <strong>Editar</strong> y vuelve a intentarlo.
        <button onClick={onClose} className="ml-3 font-semibold underline">Cerrar</button>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        ✓ Correo enviado a <strong>{enviado}</strong>.
        <button onClick={onClose} className="ml-3 font-semibold underline">Cerrar</button>
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (archivo && archivo.size > MAX_ADJUNTO) {
      setError("El archivo adjunto es demasiado grande (máximo 3 MB).");
      return;
    }
    setEnviando(true);
    try {
      let attachment;
      if (archivo) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
          r.onerror = () => reject(new Error("No se pudo leer el archivo."));
          r.readAsDataURL(archivo);
        });
        attachment = { filename: archivo.name, content: base64, type: archivo.type };
      }
      const res = await fetch(`/api/fichas/patients/${patientId}/correo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: asunto, message: mensaje, attachment }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setError(d.error || "No se pudo enviar el correo.");
      else setEnviado(d.to || email || "");
    } catch {
      setError("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Enviar correo al paciente</h3>
        <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-teal-700">Cancelar</button>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Para: <strong className="text-slate-800">{email}</strong> · sale desde Sakros (reservas@sakros.cl) y las respuestas llegan a la secretaría.
      </p>
      <label className="mb-3 block text-sm font-medium text-slate-700">Asunto *
        <input required value={asunto} onChange={(e) => setAsunto(e.target.value)} maxLength={150} className={`mt-1 ${input}`} />
      </label>
      <label className="mb-3 block text-sm font-medium text-slate-700">Mensaje / indicaciones *
        <textarea required rows={8} value={mensaje} onChange={(e) => setMensaje(e.target.value)}
          placeholder={"Ej: Durante esta semana aplica hielo 15 minutos 2 veces al día…\n\nDeja una línea en blanco para separar párrafos."}
          className={`mt-1 ${input}`} />
      </label>
      <p className="mb-3 text-xs text-slate-500">
        El correo empieza con &quot;Hola {nombre.split(" ")[0]},&quot; y termina con tu nombre, con el diseño de Sakros.
      </p>
      <label className="mb-4 block text-sm font-medium text-slate-700">Adjuntar archivo (opcional, máx. 3 MB)
        <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700" />
      </label>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={enviando || !asunto.trim() || !mensaje.trim()}
        className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
        {enviando ? "Enviando…" : "Enviar correo"}
      </button>
    </form>
  );
}
