import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Packs de Tratamiento",
  description:
    "Packs de sesiones de osteopatía, kinesiología y posturología con valores promocionales en Sakros, Viña del Mar.",
};

const packs = [
  {
    name: "Osteopatía X5",
    price: "$185.000",
    validity: "Válido por 6 meses",
    target: "Dolor, estrés y fatiga crónicos, alteraciones intestinales",
    includes: "Osteopatía estructural y asesoramiento metabólico",
  },
  {
    name: "Método Sakros",
    price: "$290.000",
    validity: "Válido por 2 meses",
    target: "+ Energía + Movimiento + Salud",
    includes:
      "1 sesión de Osteopatía + 1 sesión de Posturología + 10 sesiones de Kinesiología",
  },
  {
    name: "Plan OSTEOfamiliar",
    price: "$335.000",
    validity: "Válido por 6 meses",
    target: "Osteopatía para toda tu familia",
    includes: "Osteopatía estructural y asesoramiento metabólico",
  },
  {
    name: "Posturología X6",
    price: "$165.000",
    validity: "Válido por 6 meses",
    target: "Mala postura, escoliosis, problemas visuales, TDAH, TEA",
    includes: "Evaluación integral de la postura + 5 sesiones de tratamiento",
  },
  {
    name: "Kine x10 Viña",
    price: "$230.000",
    validity: "Válido por 1 mes",
    target: "Esguinces, tendinitis, postquirúrgico",
    includes: "Tratamiento manual y ejercicios personalizados dirigidos",
  },
  {
    name: "KINEPLUS Viña",
    price: "$250.000",
    validity: "Válido por 2 meses",
    target: "Rehabilitación integral",
    includes:
      "10 sesiones de Kinesiología + 1 sesión de Osteopatía o Evaluación Biomecánica del pie",
  },
];

export default function PacksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Packs de Sesiones
      </h1>
      <p className="text-slate-600 max-w-2xl mb-10">
        Valores promocionales — cancela en tu primera sesión. El pack más
        adecuado se confirma en tu evaluación inicial.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <div
            key={pack.name}
            className="rounded-2xl border border-slate-200 p-6 flex flex-col"
          >
            <h2 className="font-semibold text-slate-900 text-lg mb-1">
              {pack.name}
            </h2>
            <p className="text-2xl font-bold text-slate-900 mb-1">
              {pack.price}
            </p>
            <p className="text-xs text-slate-500 mb-3">{pack.validity}</p>
            <p className="text-sm text-teal-700 font-medium mb-3">
              {pack.target}
            </p>
            <p className="text-sm text-slate-600 mt-auto pt-3 border-t border-slate-100">
              {pack.includes}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/reserva"
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reserva tu primera sesión
        </Link>
      </div>
    </div>
  );
}
