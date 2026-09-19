import { Calendar, Clock, Film, Armchair } from "lucide-react";
import { Funcion, Sala } from "../types/programacion.types";
import { StatsGrid, StatItem } from "../../../shared/components/StatCard";

interface AdminFuncionStatsProps {
  funciones: Funcion[];
  salas: Sala[];
}

export function AdminFuncionStats({ funciones, salas }: Readonly<AdminFuncionStatsProps>) {
  const todayStr = new Date().toISOString().split("T")[0];
  const funcionesHoy = funciones.filter((f) => f.fecha.startsWith(todayStr)).length;
  const programadas = funciones.filter((f) => f.estado === "programada").length;
  const salasActivas = salas.filter((s) => s.estado === "activa").length;

  const stats: StatItem[] = [
    {
      title: "Funciones Hoy",
      value: funcionesHoy,
      label: "Cartelera del día",
      icon: Calendar,
      bgIcon: "bg-[#0071e3]/10 text-[#0071e3]",
    },
    {
      title: "Total Programadas",
      value: programadas,
      label: "En oferta semanal",
      icon: Clock,
      bgIcon: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Salas en Operación",
      value: `${salasActivas} / ${salas.length}`,
      label: "Disponibilidad de espacios",
      icon: Armchair,
      bgIcon: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Películas Asignadas",
      value: new Set(funciones.map((f) => f.idPelicula)).size,
      label: "Títulos distintos en proyección",
      icon: Film,
      bgIcon: "bg-amber-500/10 text-amber-600",
    },
  ];

  return <StatsGrid stats={stats} />;
}
