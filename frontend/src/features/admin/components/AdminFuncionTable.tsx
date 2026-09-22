import { useState } from "react";
import { Funcion, Sala } from "../types/programacion.types";
import { Button } from "../../../shared/components/Button";
import {
  Search,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Armchair,
  Film,
  Plus,
} from "lucide-react";

interface AdminFuncionTableProps {
  funciones: Funcion[];
  salas: Sala[];
  onEdit: (funcion: Funcion) => void;
  onDelete: (funcion: Funcion) => void;
  onAddNew: () => void;
}

export function AdminFuncionTable({
  funciones,
  salas,
  onEdit,
  onDelete,
  onAddNew,
}: Readonly<AdminFuncionTableProps>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSalaId, setSelectedSalaId] = useState<string>("todas");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const filteredFunciones = funciones.filter((f) => {
    const movieTitle = f.pelicula?.titulo || "";
    const salaName = f.sala?.nombre || "";

    const matchesSearch =
      movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salaName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSala =
      selectedSalaId === "todas" || String(f.idSala) === selectedSalaId;

    const matchesDate = !selectedDate || f.fecha.startsWith(selectedDate);

    return matchesSearch && matchesSala && matchesDate;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStatusBadge = (estado: string) => {
    switch (estado) {
      case "programada":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Programada</span>
          </span>
        );
      case "en_curso":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>En Curso</span>
          </span>
        );
      case "finalizada":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <span>Finalizada</span>
          </span>
        );
      case "cancelada":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
            <span>Cancelada</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-appleXl border border-[#e5e5ea] shadow-appleCard overflow-hidden">
      {/* Table Controls (Search & Filters) */}
      <div className="p-4 sm:p-5 border-b border-[#f0f0f0] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por película o sala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] border border-transparent hover:border-[#e5e5ea] focus:border-[#0071e3] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Sala select */}
          <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-appleMd border border-transparent hover:border-[#e5e5ea]">
            <Armchair className="w-3.5 h-3.5 text-[#86868b]" />
            <select
              value={selectedSalaId}
              onChange={(e) => setSelectedSalaId(e.target.value)}
              className="bg-transparent text-[12px] text-[#1d1d1f] font-medium focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas las salas</option>
              {salas.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker filter */}
          <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-appleMd border border-transparent hover:border-[#e5e5ea]">
            <Calendar className="w-3.5 h-3.5 text-[#86868b]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[12px] text-[#1d1d1f] font-medium focus:outline-none cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-[10px] text-[#86868b] hover:text-[#1d1d1f] ml-1 font-semibold"
                title="Limpiar fecha"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {filteredFunciones.length === 0 ? (
        <div className="py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-applePill bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-[#86868b]">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
            No se encontraron funciones
          </h3>
          <p className="text-[13px] text-[#86868b] max-w-sm mx-auto mb-5">
            {searchTerm || selectedSalaId !== "todas" || selectedDate
              ? "Prueba cambiando los filtros de fecha o sala."
              : "Comienza programando la primera función en cartelera."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddNew}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Programar Función
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#fafafc] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                <th className="py-3.5 px-5">Película</th>
                <th className="py-3.5 px-4">Sala</th>
                <th className="py-3.5 px-4">Fecha & Horario</th>
                <th className="py-3.5 px-4">Precio Entrada</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0] text-[13px]">
              {filteredFunciones.map((funcion) => (
                <tr
                  key={funcion.id}
                  className="hover:bg-[#fafafc] transition-colors group"
                >
                  {/* Pelicula Info */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-14 rounded-appleSm overflow-hidden bg-[#f0f0f5] flex-shrink-0 border border-[#e5e5ea] flex items-center justify-center shadow-sm">
                        {funcion.pelicula?.posterUrl ? (
                          <img
                            src={funcion.pelicula.posterUrl}
                            alt={funcion.pelicula.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-4 h-4 text-[#86868b]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors line-clamp-1">
                          {funcion.pelicula?.titulo || "Película no encontrada"}
                        </h4>
                        <span className="text-[11px] text-[#86868b]">
                          {funcion.pelicula?.genero || "General"} ·{" "}
                          {funcion.pelicula?.duracionMinutos || 0} min
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Sala Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[#1d1d1f] font-medium">
                      <Armchair className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>{funcion.sala?.nombre || `Sala #${funcion.idSala}`}</span>
                    </div>
                    <span className="text-[11px] text-[#86868b]">
                      {funcion.sala?.capacidad || 0} butacas
                    </span>
                  </td>

                  {/* Fecha & Horario */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-[#1d1d1f]">
                      <Calendar className="w-3.5 h-3.5 text-[#86868b]" />
                      <span>{funcion.fecha.split("T")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-[#6e6e73] font-mono mt-0.5">
                      <Clock className="w-3 h-3 text-[#86868b]" />
                      <span>
                        {funcion.horaInicio} - {funcion.horaFin}
                      </span>
                    </div>
                  </td>

                  {/* Precio Entrada */}
                  <td className="py-3.5 px-4 font-medium text-[#1d1d1f]">
                    {formatPrice(funcion.precioAsientoOficial)}
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    {renderStatusBadge(funcion.estado)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(funcion)}
                        className="p-2 h-8 w-8 rounded-appleMd bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
                        title="Editar función"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onDelete(funcion)}
                        className="p-2 h-8 w-8 rounded-appleMd bg-red-50 hover:bg-red-100 text-red-600 border-transparent"
                        title="Eliminar función"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
