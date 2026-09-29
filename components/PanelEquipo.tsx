"use client";

import { useState, useEffect } from "react";
import CalendarioEquipo from "./CalendarioEquipo";
import PacientesTab from "./PacientesTab";
import ExerciseBank from "./fichas/ExerciseBank";

type Tab = "calendario" | "pacientes" | "ejercicios";

const TABS: { key: Tab; label: string }[] = [
  { key: "calendario", label: "Calendario" },
  { key: "pacientes", label: "Pacientes" },
  { key: "ejercicios", label: "Ejercicios" },
];

export default function PanelEquipo() {
  const [pin, setPin] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("calendario");

  // Recuperar sesión guardada
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("equipo_pin");
      if (saved) setPin(saved);
    } catch {}
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!inputPin.trim()) return;

    setChecking(true);
    setError("");

    try {
      // Verificar PIN contra la API
      const now = new Date();
      const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
      const res = await fetch(
        `/api/calendar?month=${month}&pin=${encodeURIComponent(inputPin.trim())}`
      );
      const data = await res.json();

      if (res.ok) {
        setPin(inputPin.trim());
        try { sessionStorage.setItem("equipo_pin", inputPin.trim()); } catch {}
      } else {
        setError(data.error || "PIN incorrecto.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setChecking(false);
    }
  }

  function handleLogout() {
    setPin("");
    setInputPin("");
    try { sessionStorage.removeItem("equipo_pin"); } catch {}
  }

  // Pantalla de login
  if (!pin) {
    return (
      <div className="max-w-sm mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
            Acceso Equipo
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Ingresa el PIN de acceso profesional.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              placeholder="PIN de acceso"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-lg tracking-widest focus:border-teal-700 focus:outline-none"
              autoFocus
            />
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={checking || !inputPin.trim()}
              className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {checking ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Panel principal con tabs
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Sakros</h1>
          <p className="text-sm text-slate-500">Gestión profesional del equipo</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-red-600"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition ${
              activeTab === tab.key
                ? "bg-white text-teal-700 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === "calendario" && <CalendarioEquipo pin={pin} />}
      {activeTab === "pacientes" && <PacientesTab pin={pin} />}
      {activeTab === "ejercicios" && <ExerciseBank onBack={() => setActiveTab("pacientes")} />}
    </div>
  );
}
