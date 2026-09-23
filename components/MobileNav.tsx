"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/servicios", label: "Servicios" },
  { href: "/reserva", label: "Reserva" },
  { href: "/evidencia-metodologia", label: "Evidencia" },
  { href: "/quienes-somos", label: "Quiénes Somos" },
  { href: "/blog", label: "Blog" },
  { href: "/packs-tratamiento", label: "Packs" },
  { href: "/contacto", label: "Contacto" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
          <nav className="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col pt-20 px-6" style={{backgroundColor: '#ffffff'}}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-3 border-b border-slate-100 text-base font-medium ${
                  pathname === link.href ? "text-teal-700" : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reserva"
              onClick={() => setOpen(false)}
              className="mt-6 block rounded-full bg-teal-700 px-5 py-3 text-center text-base font-semibold text-white hover:bg-teal-800"
            >
              Reserva tu hora
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
