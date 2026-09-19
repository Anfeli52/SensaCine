import { Calendar, Clock, Film, Armchair, Sparkles } from "lucide-react";
import { Funcion, Sala } from "../types/programacion.types";

interface AdminFuncionStatsProps {
  funciones: Funcion[];
  salas: Sala[];
}

export function AdminFuncionStats({ funciones, salas }: AdminFuncionStatsProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const funcionesHoy = funciones.filter((f) => f.fecha.startsWith(todayStr)).length;
  const programadas = funciones.filter((f) => f.estado === "programada").length;
  const salasActivas = salas.filter((s) => s.estado === "activa").length;

  const stats = [
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard hover:shadow-appleCardHover transition-all duration-300"
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
