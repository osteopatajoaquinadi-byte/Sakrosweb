import { FUENTES_EXTERNAS, enlaceFuente } from "@/lib/protocolos/ejercicios";
import type { Ejercicio } from "@/lib/protocolos/types";

/** Enlaces para ver el ejercicio en las bibliotecas externas y el video propio. */
export default function FuentesEjercicio({ ejercicio }: { ejercicio: Ejercicio }) {
  return (
    <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-slate-400">
      {ejercicio.video && (
        <a href={ejercicio.video} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 hover:underline">
          ▶ Video Sakros
        </a>
      )}
      {FUENTES_EXTERNAS.map((f) => (
        <a key={f.id} href={enlaceFuente(f.site, ejercicio)} target="_blank" rel="noopener noreferrer" className="hover:text-teal-700 hover:underline">
          {f.label}
        </a>
      ))}
    </p>
  );
}
