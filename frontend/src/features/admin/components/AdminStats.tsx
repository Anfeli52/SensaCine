import { Film, CheckCircle2, Clock, EyeOff, Sparkles } from "lucide-react";
import { Pelicula } from "../../catalogo/types";

interface AdminStatsProps {
  peliculas: Pelicula[];
}

export function AdminStats({ peliculas }: AdminStatsProps) {
  const total = peliculas.length;
  const activas = peliculas.filter((p) => p.estado === "activa").length;
  const proximas = peliculas.filter((p) => p.estado === "proximamente").length;
  const inactivas = peliculas.filter((p) => p.estado === "inactiva").length;

  const stats = [
    {
      title: "Total Películas",
      value: total,
      label: "Catálogo completo",
      icon: Film,
      bgIcon: "bg-[#0071e3]/10 text-[#0071e3]",
    },
    {
      title: "En Cartelera",
      value: activas,
      label: "Visibles al público",
      icon: CheckCircle2,
      bgIcon: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Próximamente",
      value: proximas,
      label: "Estrenos anunciados",
      icon: Clock,
      bgIcon: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Inactivas",
      value: inactivas,
      label: "Ocultas de cartelera",
      icon: EyeOff,
      bgIcon: "bg-[#86868b]/10 text-[#86868b]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard hover:shadow-appleCardHover transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-[#86868b] tracking-tight uppercase">
                {item.title}
              </span>
              <div className={`p-2 rounded-appleMd ${item.bgIcon}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
                {item.value}
              </span>
            </div>
            <p className="text-[12px] text-[#86868b] mt-1 font-normal flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0071e3] opacity-60" />
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
