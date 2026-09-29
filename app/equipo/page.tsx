import type { Metadata } from "next";
import { Suspense } from "react";
import PanelEquipo from "@/components/PanelEquipo";

export const metadata: Metadata = {
  title: "Equipo — Sakros",
  robots: "noindex, nofollow",
};

export default function EquipoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Suspense fallback={<p className="text-slate-500">Cargando...</p>}>
        <PanelEquipo />
      </Suspense>
    </div>
  );
}
