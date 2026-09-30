"use client";

import { useState, useEffect } from "react";
import CalendarioEquipo from "./CalendarioEquipo";
import PacientesTab from "./PacientesTab";
import type { Permission, StaffUser } from "@/lib/equipo-auth";

type Tab = "calendario" | "pacientes";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  profesional: "Profesional",
  secretaria: "Secretaría",
};

export default function PanelEquipo() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [checkingSession, setCheckingSession] = useState(true);

  const [username, setUsername] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("calendario");

  const [showPinForm, setShowPinForm] = useState(false);
  const [pinForm, setPinForm] = useState({ current: "", next: "", confirm: "" });
  const [pinMsg, setPinMsg] = useState("");

  // Recuperar sesión (cookie httpOnly)
  useEffect(() => {
    fetch("/api/equipo/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          setPermissions(d.permissions ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !inputPin.trim()) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/equipo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin: inputPin.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setPermissions(data.permissions ?? []);
        setInputPin("");
      } else {
        setError(data.error || "Usuario o PIN incorrecto.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setChecking(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/equipo/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setPermissions([]);
    setUsername("");
    setInputPin("");
    setActiveTab("calendario");
  }

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setPinMsg("");
    if (pinForm.next !== pinForm.confirm) {
      setPinMsg("Los PIN nuevos no coinciden.");
      return;
    }
    const res = await fetch("/api/equipo/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_pin: pinForm.current, new_pin: pinForm.next }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      setPinMsg("PIN actualizado.");
      setPinForm({ current: "", next: "", confirm: "" });
    } else {
      setPinMsg(d.error || "No se pudo cambiar el PIN.");
    }
  }

  if (checkingSession) {
    return <p className="text-slate-500 text-center py-8">Cargando...</p>;
  }

  // Pantalla de login
  if (!user) {
    return (
      <div className="max-w-sm mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Acceso Equipo</h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Ingresa tu usuario y tu PIN personal.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              autoComplete="username"
              autoCapitalize="none"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
              autoFocus
            />
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              placeholder="PIN"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
            />
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={checking || !username.trim() || !inputPin.trim()}
              className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {checking ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    ...(permissions.includes("calendario") ? [{ key: "calendario" as Tab, label: "Calendario" }] : []),
    ...(permissions.includes("pacientes")
      ? [{ key: "pacientes" as Tab, label: permissions.includes("clinico") ? "Pacientes" : "Pacientes y pagos" }]
      : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Sakros</h1>
          <p className="text-sm text-slate-500">
            {user.display_name} · {ROLE_LABELS[user.role] ?? user.role}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setShowPinForm(!showPinForm); setPinMsg(""); }}
            className="text-sm text-slate-500 hover:text-teal-700"
          >
            Cambiar PIN
          </button>
          <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-600">
            Cerrar sesión
          </button>
        </div>
      </div>

      {showPinForm && (
        <form onSubmit={handleChangePin} className="rounded-xl border border-slate-200 bg-white p-5 mb-6 max-w-md">
          <h3 className="font-semibold text-slate-900 mb-3">Cambiar mi PIN</h3>
          <div className="space-y-3">
            {(
              [
                ["current", "PIN actual"],
                ["next", "PIN nuevo (mínimo 8 caracteres)"],
                ["confirm", "Repite el PIN nuevo"],
              ] as const
            ).map(([key, label]) => (
              <input
                key={key}
                type="password"
                placeholder={label}
                value={pinForm[key]}
                onChange={(e) => setPinForm({ ...pinForm, [key]: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
              />
            ))}
          </div>
          {pinMsg && <p className="text-sm mt-3 text-slate-700">{pinMsg}</p>}
          <button
            type="submit"
            className="mt-4 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Guardar PIN
          </button>
        </form>
      )}

      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {tabs.map((tab) => (
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

      {activeTab === "calendario" && permissions.includes("calendario") && (
        <CalendarioEquipo permissions={permissions} />
      )}
      {activeTab === "pacientes" && permissions.includes("pacientes") && (
        <PacientesTab permissions={permissions} />
      )}
    </div>
  );
}
