import type { Metadata } from "next";
import ResponderCuestionario from "@/components/cuestionarios/ResponderCuestionario";

export const metadata: Metadata = {
  title: "Cuestionario | Sakros",
  robots: { index: false, follow: false },
};

export default async function CuestionarioPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <ResponderCuestionario token={token} />
    </div>
  );
}
