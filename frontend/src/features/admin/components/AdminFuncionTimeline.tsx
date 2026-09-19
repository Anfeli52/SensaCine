import { Funcion, Sala } from "../types/programacion.types";
import { Clock, Pencil, Trash2 } from "lucide-react";


interface AdminFuncionTimelineProps {
  funciones: Funcion[];
  salas: Sala[];
  selectedDate: string;
  onEdit: (funcion: Funcion) => void;
  onDelete: (funcion: Funcion) => void;
}

export function AdminFuncionTimeline({
  funciones,
  salas,
  selectedDate,
  onEdit,
  onDelete,
}: Readonly<AdminFuncionTimelineProps>) {
  // Filtrar funciones para la fecha seleccionada
  const dayFunciones = funciones.filter(
    (f) => f.fecha === selectedDate || f.fecha.startsWith(selectedDate)
  );

  // Rango de horas a mostrar en el timeline (11:00 a 24:00)
  const START_HOUR = 11;
  const END_HOUR = 24;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const getPositionPercent = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    const totalMin = (h - START_HOUR) * 60 + m;
    const totalTimelineMin = TOTAL_HOURS * 60;
    return Math.max(0, Math.min(100, (totalMin / totalTimelineMin) * 100));
  };

  const getWidthPercent = (startStr: string, endStr: string) => {
    const start = getPositionPercent(startStr);
    const end = getPositionPercent(endStr);
    return Math.max(4, end - start);
  };

  return (
    <div className="bg-white rounded-appleXl border border-[#e5e5ea] shadow-appleCard p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-[16px] text-[#1d1d1f]">
            Cronograma Visual de Salas (Timeline)
          </h3>
          <p className="text-[12px] text-[#86868b]">
            Visualiza la ocupación de salas y espacios libres para el día{" "}
            <strong>{selectedDate}</strong>
          </p>
        </div>
      </div>

      {/* Timeline container */}
      <div className="overflow-x-auto min-w-[700px]">
        {/* Hours Header Axis */}
        <div className="grid grid-cols-13 gap-0 border-b border-[#e5e5ea] pb-2 text-[11px] font-semibold text-[#86868b] pl-44">
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
            const hour = START_HOUR + i;
            return (
              <div key={hour} className="text-left">
                {String(hour).padStart(2, "0")}:00
              </div>
            );
          })}
        </div>

        {/* Tracks by Sala */}
        <div className="divide-y divide-[#f0f0f0]">
          {salas.map((sala) => {
            const salaFunciones = dayFunciones.filter((f) => f.idSala === sala.id);

            return (
              <div key={sala.id} className="flex items-center py-4 group">
                {/* Sala Info Col */}
                <div className="w-44 pr-4 flex-shrink-0">
                  <h4 className="font-semibold text-[13px] text-[#1d1d1f] truncate">
                    {sala.nombre}
                  </h4>
                  <span className="text-[11px] text-[#86868b]">
                    {sala.capacidad} butacas · {salaFunciones.length} funciones
                  </span>
                </div>

                {/* Track Bar */}
                <div className="flex-grow h-14 bg-[#fafafc] rounded-appleMd border border-[#e5e5ea] relative p-1">
                  {/* Hour guide vertical lines */}
                  {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                    <div
                      key={`guide-${sala.id}-${START_HOUR + i}`}
                      className="absolute top-0 bottom-0 border-r border-[#f0f0f0]"
                      style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                    />
                  ))}

                  {/* Movie Blocks in this room */}
                  {salaFunciones.map((funcion) => {
                    const left = getPositionPercent(funcion.horaInicio);
                    const width = getWidthPercent(funcion.horaInicio, funcion.horaFin);

                    return (
                      <div
                        key={funcion.id}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        className="absolute top-1 bottom-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-appleSm p-1.5 shadow-sm transition-all duration-200 cursor-pointer overflow-hidden group/block flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate block leading-tight">
                            {funcion.pelicula?.titulo || "Película"}
                          </span>
                          <div className="opacity-0 group-hover/block:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(funcion);
                              }}
                              className="p-0.5 hover:text-white"
                              title="Editar"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(funcion);
                              }}
                              className="p-0.5 hover:text-red-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] opacity-90">
                          <span className="flex items-center gap-0.5 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {funcion.horaInicio} - {funcion.horaFin}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {salaFunciones.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[11px] text-[#86868b] italic">
                      Sala libre para programación
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
