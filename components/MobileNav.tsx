"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/reserva", label: "Reserva" },
  { href: "/evidencia-metodologia", label: "Evidencia" },
  { href: "/quienes-somos", label: "Quiénes Somos" },
  { href: "/blog", label: "Blog" },
  { href: "/packs-tratamiento", label: "Packs" },
  { href: "/contacto", label: "Contacto" },
];

function MenuPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      {/* Overlay */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 288,
          height: "100%",
          background: "#ffffff",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          paddingTop: 24,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            alignSelf: "flex-end",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "none",
            background: "#f1f5f9",
            cursor: "pointer",
            fontSize: 20,
            color: "#334155",
            marginBottom: 16,
          }}
        >
          ✕
        </button>
        {/* Links */}
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            style={{
              display: "block",
              padding: "14px 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: 16,
              fontWeight: pathname === link.href ? 700 : 500,
              color: pathname === link.href ? "#0f766e" : "#334155",
              textDecoration: "none",
            }}
          >
            {link.label}
          </Link>
        ))}
        {/* CTA */}
        <Link
          href="/reserva"
          onClick={onClose}
          style={{
            display: "block",
            marginTop: 24,
            padding: "14px 20px",
            borderRadius: 9999,
            background: "#0f766e",
            color: "#ffffff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Reserva tu hora
        </Link>
      </div>
    </div>,
    document.body
  );
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
        style={{
          display: "flex",
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      {mounted && open && <MenuPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
