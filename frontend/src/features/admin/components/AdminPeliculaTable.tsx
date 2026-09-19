import { useState } from "react";
import { Pelicula } from "../../catalogo/types";
import { Button } from "../../../shared/components/Button";
import {
  Search,
  Pencil,
  Trash2,
  Film,
  Clock,
  Plus,
} from "lucide-react";


interface AdminPeliculaTableProps {
  peliculas: Pelicula[];
  onEdit: (pelicula: Pelicula) => void;
  onDelete: (pelicula: Pelicula) => void;
  onAddNew: () => void;
}

export function AdminPeliculaTable({
  peliculas,
  onEdit,
  onDelete,
  onAddNew,
}: AdminPeliculaTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todas");

  const filteredPeliculas = peliculas.filter((pelicula) => {
    const matchesSearch =
      pelicula.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pelicula.genero && pelicula.genero.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstado =
      selectedEstado === "todas" || pelicula.estado === selectedEstado;

    return matchesSearch && matchesEstado;
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
      case "activa":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-applePill text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En Cartelera
          </span>
        );
      case "proximamente":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-applePill text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Próximamente
          </span>
        );
      case "inactiva":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-applePill text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactiva
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-appleXl border border-[#e5e5ea] shadow-appleCard overflow-hidden">
      {/* Table Controls (Search & Filter) */}
      <div className="p-4 sm:p-5 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título o género..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] border border-transparent hover:border-[#e5e5ea] focus:border-[#0071e3] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-appleLg w-full sm:w-auto overflow-x-auto">
          {[
            { id: "todas", label: "Todas" },
            { id: "activa", label: "En Cartelera" },
            { id: "proximamente", label: "Próximamente" },
            { id: "inactiva", label: "Inactivas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedEstado(tab.id)}
              className={`px-3 py-1.5 rounded-appleMd text-[12px] font-medium transition-all whitespace-nowrap ${
                selectedEstado === tab.id
                  ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table or Empty State */}
      {filteredPeliculas.length === 0 ? (
        <div className="py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-applePill bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-[#86868b]">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
            No se encontraron películas
          </h3>
          <p className="text-[13px] text-[#86868b] max-w-sm mx-auto mb-5">
            {searchTerm || selectedEstado !== "todas"
              ? "Prueba cambiando los filtros o la búsqueda."
              : "Comienza subiendo la primera película a la plataforma."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddNew}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Agregar Película
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#fafafc] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                <th className="py-3.5 px-5">Película</th>
                <th className="py-3.5 px-4">Género & Clasif.</th>
                <th className="py-3.5 px-4">Duración</th>
                <th className="py-3.5 px-4">Precio Experiencia</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0] text-[13px]">
              {filteredPeliculas.map((pelicula) => (
                <tr
                  key={pelicula.id}
                  className="hover:bg-[#fafafc] transition-colors group"
                >
                  {/* Pelicula Info & Poster */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-16 rounded-appleSm overflow-hidden bg-[#f0f0f5] flex-shrink-0 border border-[#e5e5ea] flex items-center justify-center shadow-sm">
                        {pelicula.posterUrl ? (
                          <img
                            src={pelicula.posterUrl}
                            alt={pelicula.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-5 h-5 text-[#86868b]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors line-clamp-1">
                          {pelicula.titulo}
                        </h4>
                        {pelicula.sinopsis && (
                          <p className="text-[11px] text-[#86868b] line-clamp-1 max-w-xs mt-0.5">
                            {pelicula.sinopsis}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Genero & Clasificacion */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#1d1d1f] font-medium">
                        {pelicula.genero || "Sin género"}
                      </span>
                      {pelicula.clasificacion && (
                        <span className="text-[11px] text-[#86868b]">
                          {pelicula.clasificacion}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Duracion */}
                  <td className="py-3.5 px-4 text-[#6e6e73]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                      <span>{pelicula.duracionMinutos} min</span>
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="py-3.5 px-4 font-medium text-[#1d1d1f]">
                    {formatPrice(pelicula.precioBaseExperiencia)}
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    {renderStatusBadge(pelicula.estado)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(pelicula)}
                        className="p-2 h-8 w-8 rounded-appleMd bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
                        title="Editar película"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onDelete(pelicula)}
                        className="p-2 h-8 w-8 rounded-appleMd bg-red-50 hover:bg-red-100 text-red-600 border-transparent"
                        title="Eliminar película"
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
