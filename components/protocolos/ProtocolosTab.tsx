"use client";

import { useMemo, useState } from "react";
import { getEjercicio } from "@/lib/protocolos/ejercicios";
import { PROTOCOLOS, buscarProtocolos } from "@/lib/protocolos/protocolos";
import type { Area, Protocolo } from "@/lib/protocolos/types";
import PerfilForm from "./PerfilForm";
import PlanBuilder from "./PlanBuilder";
import ProtocoloView from "./ProtocoloView";
import { useGenerados, usePerfil, usePlan } from "./storage";

type Vista = { tipo: "inicio" } | { tipo: "protocolo"; protocolo: Protocolo } | { tipo: "plan" } | { tipo: "perfil" };

export default function ProtocolosTab({ nombreProfesional }: { nombreProfesional: string }) {
  const [vista, setVista] = useState<Vista>({ tipo: "inicio" });
  const [consulta, setConsulta] = useState("");
  const [area, setArea] = useState<Area | "todas">("todas");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  const perfil = usePerfil();
  const plan = usePlan();
  const generados = useGenerados();

  const perfilActual = perfil.valor.nombre ? perfil.valor : { ...perfil.valor, nombre: nombreProfesional };

  const resultados = useMemo(() => {
    const ia = consulta.trim() ? generados.lista.filter((g) => coincide(g, consulta)) : generados.lista;
    return [...buscarProtocolos(consulta), ...ia].filter((p) => area === "todas" || p.area === area);
  }, [consulta, area, generados.lista]);

  const idsEnPlan = useMemo(() => new Set(plan.valor.items.map((i) => i.ejercicioId)), [plan.valor.items]);

  type Nuevo = { ejercicioId: string; dosis: string; fase: string };

  function agregarVarios(nuevos: Nuevo[], protocolo?: string) {
    const items = nuevos.flatMap(({ ejercicioId, dosis, fase }) => {
      const ej = getEjercicio(ejercicioId);
      return ej ? [{ uid: crypto.randomUUID(), ejercicioId, nombre: ej.nombre, dosis, notas: "", fase }] : [];
    });
    if (items.length === 0) return;
    plan.guardar({
      ...plan.valor,
      protocolo: plan.valor.protocolo || protocolo || "",
      items: [...plan.valor.items, ...items],
    });
  }

  function agregar(ejercicioId: string, dosis: string, fase: string, protocolo?: string) {
    agregarVarios([{ ejercicioId, dosis, fase }], protocolo);
  }

  async function generar() {
    setGenerando(true);
    setError("");
    try {
      const res = await fetch("/api/protocolos/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "No se pudo generar el protocolo.");
      generados.guardar(d.protocolo);
      setVista({ tipo: "protocolo", protocolo: d.protocolo });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerando(false);
    }
  }

  if (vista.tipo === "perfil") {
    return (
      <PerfilForm
        perfil={perfilActual}
        onGuardar={perfil.guardar}
        onCerrar={() => setVista({ tipo: "inicio" })}
      />
    );
  }

  if (vista.tipo === "plan") {
    return (
      <PlanBuilder
        plan={plan.valor}
        perfil={perfilActual}
        onCambiar={plan.guardar}
        onAgregar={(id, dosis, fase) => agregar(id, dosis, fase)}
        onEditarPerfil={() => setVista({ tipo: "perfil" })}
        onVolver={() => setVista({ tipo: "inicio" })}
      />
    );
  }

  if (vista.tipo === "protocolo") {
    const p = vista.protocolo;
    return (
      <ProtocoloView
        protocolo={p}
        idsEnPlan={idsEnPlan}
        totalPlan={plan.valor.items.length}
        onAgregar={(id, dosis, fase) => agregar(id, dosis, fase, p.titulo)}
        onAgregarVarios={(nuevos) => agregarVarios(nuevos, p.titulo)}
        onVolver={() => setVista({ tipo: "inicio" })}
        onIrAlPlan={() => setVista({ tipo: "plan" })}
      />
    );
  }

  // ── Inicio ──
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Protocolos de tratamiento</h2>
          <p className="text-sm text-slate-500">Evidencia resumida, fases por semana y plan de ejercicios en PDF.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setVista({ tipo: "perfil" })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Mi perfil
          </button>
          <button onClick={() => setVista({ tipo: "plan" })} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Plan ({plan.valor.items.length})
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (resultados.length === 0 && consulta.trim().length >= 3) generar();
        }}
      >
        <input
          type="search"
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setError("");
          }}
          placeholder="Busca una patología: LCA, menisco, hombro, cefalea, colon irritable…"
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base shadow-sm focus:border-teal-700 focus:outline-none"
          autoFocus
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["todas", "Todas"],
            ["kinesiologia", "Kinesiología"],
            ["osteopatia", "Osteopatía"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setArea(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              area === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {resultados.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {resultados.map((p) => (
            <button
              key={p.id}
              onClick={() => setVista({ tipo: "protocolo", protocolo: p })}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-teal-600 hover:shadow-sm"
            >
              <div className="mb-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{p.area === "osteopatia" ? "Osteopatía" : "Kinesiología"}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{p.fases.length} fases</span>
                {p.origen === "ia" && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">IA</span>}
              </div>
              <p className="font-semibold text-slate-900 group-hover:text-teal-700">{p.titulo}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.descripcion}</p>
              <p className="mt-2 text-xs text-slate-400">
                {p.referencias.length} referencias · actualizado {p.actualizado}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Generación con IA: siempre disponible para la búsqueda escrita */}
      {consulta.trim().length >= 3 && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
          <p className="font-semibold text-violet-950">
            {resultados.length === 0 ? `No hay un protocolo base para "${consulta.trim()}".` : "¿No es lo que buscas?"}
          </p>
          <p className="mt-1 text-sm text-violet-900/80">
            La IA busca en PubMed las revisiones sistemáticas y guías más recientes, resume la evidencia citándolas y arma las fases con ejercicios de la biblioteca. Tarda 1–2 minutos.
          </p>
          <button
            onClick={generar}
            disabled={generando}
            className="mt-3 rounded-full bg-violet-700 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
          >
            {generando ? "Buscando evidencia y armando el protocolo…" : `Generar protocolo para "${consulta.trim()}"`}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {generados.lista.length > 0 && !consulta && (
        <p className="text-xs text-slate-400">
          Los protocolos generados con IA quedan guardados en este dispositivo.{" "}
          <button
            className="underline hover:text-red-600"
            onClick={() => window.confirm("¿Eliminar los protocolos generados con IA de este dispositivo?") && generados.lista.forEach((g) => generados.eliminar(g.id))}
          >
            Eliminarlos
          </button>
        </p>
      )}

      <p className="text-xs text-slate-400">
        {PROTOCOLOS.length} protocolos base con referencias verificadas en PubMed. Herramienta de apoyo clínico: no reemplaza el juicio profesional.
      </p>
    </div>
  );
}

function coincide(p: Protocolo, consulta: string) {
  const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return n(`${p.titulo} ${p.descripcion}`).includes(n(consulta.trim()));
}
