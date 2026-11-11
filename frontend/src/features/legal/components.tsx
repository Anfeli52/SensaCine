import { ReactNode } from "react";

export const CONTACTO_LEGAL = "sensacine@gmail.com";
export const ULTIMA_ACTUALIZACION = "8 de noviembre de 2026";

export function LegalPage({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">{titulo}</h1>
      <p className="mt-2 text-sm text-[#86868b]">Última actualización: {ULTIMA_ACTUALIZACION}</p>
      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-[#424245]">{children}</div>
    </div>
  );
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-[#1d1d1f]">{titulo}</h2>
      {children}
    </section>
  );
}
