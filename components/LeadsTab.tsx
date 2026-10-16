"use client";

import { useState, useEffect, useCallback } from "react";

type Lead = {
  id: string;
  created_at: string;
  nombre: string;
  whatsapp: string;
  dolor: string;
  duracion: string;
  hace_deporte: string;
  servicio: string;
  estado: string;
  notas: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const ESTADOS = [
  { key: "nuevo", label: "Nuevo", color: "bg-blue-100 text-blue-800" },
  { key: "contactado", label: "Contactado", color: "bg-yellow-100 text-yellow-800" },
  { key: "agendado", label: "Agendado", color: "bg-green-100 text-green-800" },
  { key: "no_responde", label: "No responde", color: "bg-orange-100 text-orange-800" },
  { key: "descartado", label: "Descartado", color: "bg-slate-100 text-slate-600" },
] as const;

const SERVICIOS = [
  { key: "", label: "Todos" },
  { key: "osteopatia", label: "Osteopatía" },
  { key: "kinesiologia", label: "Kinesiología" },
  { key: "posturologia", label: "Posturología" },
];

function estadoBadge(estado: string) {
  const e = ESTADOS.find((s) => s.key === estado);
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${e?.color ?? "bg-slate-100 text-slate-600"}`}>
      {e?.label ?? estado}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

export default function LeadsTab({ pin }: { pin: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterServicio, setFilterServicio] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pin });
    if (filterServicio) params.set("servicio", filterServicio);
    if (filterEstado) params.set("estado", filterEstado);

    try {
      const res = await fetch(`/api/campaign-leads?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [pin, filterServicio, filterEstado]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function updateLead(id: string, updates: { estado?: string; notas?: string }) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/campaign-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-equipo-pin": pin },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
        );
      }
    } catch {
      // silencioso
    } finally {
      setUpdatingId(null);
    }
  }

  // Conteos
  const counts = {
    total: leads.length,
    nuevo: leads.filter((l) => l.estado === "nuevo").length,
    contactado: leads.filter((l) => l.estado === "contactado").length,
    agendado: leads.filter((l) => l.estado === "agendado").length,
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{counts.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-2xl font-bold text-blue-800">{counts.nuevo}</p>
          <p className="text-xs text-blue-600">Nuevos</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-800">{counts.contactado}</p>
          <p className="text-xs text-yellow-600">Contactados</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-800">{counts.agendado}</p>
          <p className="text-xs text-green-600">Agendados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterServicio}
          onChange={(e) => setFilterServicio(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          {SERVICIOS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.key} value={e.key}>{e.label}</option>
          ))}
        </select>
        <button
          onClick={fetchLeads}
          className="ml-auto rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-slate-500 py-8">Cargando leads...</p>
      ) : leads.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No hay leads con estos filtros.</p>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const isExpanded = expandedId === lead.id;
            return (
              <div
                key={lead.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                {/* Fila principal */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {lead.nombre}
                      </span>
                      {estadoBadge(lead.estado)}
                      <span className="text-xs text-slate-400 capitalize">
                        {lead.servicio}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {lead.dolor} · {lead.duracion} · {timeAgo(lead.created_at)}
                    </p>
                  </div>
                  <span className="text-slate-400 text-sm shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50">
                    {/* Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">WhatsApp</p>
                        <a
                          href={`https://wa.me/56${lead.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 font-medium hover:underline"
                        >
                          +56 {lead.whatsapp}
                        </a>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Dolor</p>
                        <p className="text-slate-900">{lead.dolor}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Duración</p>
                        <p className="text-slate-900">{lead.duracion}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Deporte</p>
                        <p className="text-slate-900">{lead.hace_deporte}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Fecha</p>
                        <p className="text-slate-900">
                          {new Date(lead.created_at).toLocaleDateString("es-CL", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {lead.utm_campaign && (
                        <div>
                          <p className="text-slate-500 text-xs">Campaña</p>
                          <p className="text-slate-900 text-xs">
                            {lead.utm_source}/{lead.utm_medium}/{lead.utm_campaign}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cambiar estado */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1.5">Cambiar estado</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ESTADOS.map((e) => (
                          <button
                            key={e.key}
                            disabled={lead.estado === e.key || updatingId === lead.id}
                            onClick={() => updateLead(lead.id, { estado: e.key })}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              lead.estado === e.key
                                ? `${e.color} ring-2 ring-offset-1 ring-current`
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            } disabled:opacity-50`}
                          >
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1.5">Notas</p>
                      <textarea
                        defaultValue={lead.notas || ""}
                        placeholder="Agregar notas..."
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-600 focus:outline-none"
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          if (val !== (lead.notas || "")) {
                            updateLead(lead.id, { notas: val });
                          }
                        }}
                      />
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/56${lead.whatsapp}?text=${encodeURIComponent(
                          `Hola ${lead.nombre.split(" ")[0]}, te escribo de Sakros. Recibimos tu formulario, ¿te acomoda coordinar una evaluación?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </a>
                      <a
                        href={`tel:+56${lead.whatsapp}`}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        📞 Llamar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
