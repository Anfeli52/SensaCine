import { Film, CheckCircle2, Clock, EyeOff } from "lucide-react";
import { Pelicula } from "../../catalogo/types";
import { StatsGrid, StatItem } from "../../../shared/components/StatCard";

interface AdminStatsProps {
  peliculas: Pelicula[];
}

export function AdminStats({ peliculas }: Readonly<AdminStatsProps>) {
  const total = peliculas.length;
  const activas = peliculas.filter((p) => p.estado === "activa").length;
  const proximas = peliculas.filter((p) => p.estado === "proximamente").length;
  const inactivas = peliculas.filter((p) => p.estado === "inactiva").length;

  const stats: StatItem[] = [
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

  return <StatsGrid stats={stats} />;
}
