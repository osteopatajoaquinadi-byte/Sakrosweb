"use client";

import { useState } from "react";
import { creditoImagenes } from "@/lib/protocolos/ejercicios";
import type { Ejercicio } from "@/lib/protocolos/types";
import FuentesEjercicio from "./FuentesEjercicio";

/** Miniatura + botón "Cómo se hace" que despliega fotos e instrucciones. */
export default function FichaEjercicio({ ejercicio: e, dosis }: { ejercicio: Ejercicio; dosis?: string }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-3">
        {e.imagenes?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.imagenes[0]} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-400">
            {e.video ? "▶ video" : "sin foto"}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-slate-800">{e.nombre}</p>
          <p className="text-xs text-slate-500">{dosis ?? e.dosis}</p>
          <button onClick={() => setAbierta(!abierta)} className="text-xs font-semibold text-teal-700 hover:underline">
            {abierta ? "Ocultar" : "Cómo se hace"}
          </button>
        </div>
      </div>

      {abierta && (
        <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {e.imagenes && (
            <div>
              <div className="grid grid-cols-2 gap-2">
                {e.imagenes.map((src, i) => (
                  <figure key={src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${e.nombre}: ${i === 0 ? "inicio" : "final"}`} loading="lazy" className="w-full rounded-lg" />
                    <figcaption className="mt-0.5 text-center text-[11px] text-slate-500">{i === 0 ? "Inicio" : "Final"}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{creditoImagenes([e.id])}</p>
            </div>
          )}
          {e.video && (
            <video src={e.video} controls playsInline preload="none" className="w-full rounded-lg bg-black" />
          )}
          <p>
            <span className="font-semibold text-slate-900">Posición inicial: </span>
            {e.posicion}
          </p>
          <div>
            <p className="font-semibold text-slate-900">Cómo hacerlo</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {e.pasos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </div>
          {e.claves.length > 0 && (
            <p>
              <span className="font-semibold text-emerald-800">Clave: </span>
              {e.claves.join(" ")}
            </p>
          )}
          {e.evitar.length > 0 && (
            <p>
              <span className="font-semibold text-rose-800">Evita: </span>
              {e.evitar.join(" ")}
            </p>
          )}
          <p className="text-xs text-slate-500">Material: {e.equipo}</p>
          <FuentesEjercicio ejercicio={e} />
        </div>
      )}
    </div>
  );
}
