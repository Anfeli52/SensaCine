import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pelicula } from "../types";
import { Modal } from "../../../shared/components/Modal";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { Spinner } from "../../../shared/components/Spinner";
import { useFuncionesDisponibles } from "../hooks/usePeliculas";
import {
  Clock,
  Calendar,
  Armchair,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";


interface MovieModalProps {
  pelicula: Pelicula | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieModal({ pelicula, isOpen, onClose }: Readonly<MovieModalProps>) {
  const navigate = useNavigate();
  const { data: funciones = [], isLoading } = useFuncionesDisponibles(pelicula?.id);
  const [selectedFuncionId, setSelectedFuncionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const navigate = useNavigate();

  // Obtener fechas únicas disponibles
  const uniqueDates = (
    Array.from(new Set(funciones.map((f: any) => f.fecha.split("T")[0]))) as string[]
  ).sort((a, b) => a.localeCompare(b));

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (uniqueDates.length > 0) {
      if (!selectedDate || !uniqueDates.includes(selectedDate)) {
        setSelectedDate(uniqueDates[0]);
      }
    } else {
      setSelectedDate("");
    }
    setSelectedFuncionId(null);
  }, [funciones, isOpen]);

  if (!pelicula) return null;

  // Funciones para la fecha seleccionada
  const funcionesDeFecha = funciones.filter(
    (f: any) => f.fecha.split("T")[0] === selectedDate
  );

  const formatTabDate = (dateStr: string) => {
    if (dateStr === todayStr) return "Hoy";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);

    // Si es mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    if (dateStr === tomorrowStr) return "Mañana";

    return dateObj.toLocaleDateString("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const selectedFuncion = funciones.find((f: any) => f.id === selectedFuncionId);

  const renderFuncionesContent = () => {
    if (isLoading) {
      return (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-center">
          <Spinner size="sm" />
          <p className="text-[12px] text-[#86868b]">Buscando horarios disponibles...</p>
        </div>
      );
    }

    if (uniqueDates.length === 0) {
      return (
        <div className="py-8 px-4 bg-[#fafafc] rounded-appleLg border border-[#e5e5ea] text-center">
          <Calendar className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-60" />
          <h4 className="text-[13px] font-semibold text-[#1d1d1f]">
            No hay funciones programadas
          </h4>
          <p className="text-[12px] text-[#86868b] mt-0.5 max-w-xs mx-auto">
            No hay funciones disponibles para esta película en los próximos días. ¡Vuelve pronto!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Date selection pill tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {uniqueDates.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedFuncionId(null);
                }}
                className={`px-3.5 py-1.5 rounded-applePill text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${isSelected
                    ? "bg-[#0071e3] text-white shadow-sm font-semibold"
                    : "bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]"
                  }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatTabDate(dateStr)}</span>
              </button>
            );
          })}
        </div>

        {/* Showtimes Grid for selected date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {funcionesDeFecha.map((funcion: any) => {
            const isSelected = selectedFuncionId === funcion.id;

            return (
              <button
                key={funcion.id}
                type="button"
                onClick={() => setSelectedFuncionId(funcion.id)}
                className={`text-left w-full p-3.5 rounded-appleLg border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2.5 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 ${isSelected
                    ? "bg-[#0071e3]/5 border-[#0071e3] shadow-md ring-2 ring-[#0071e3]/20"
                    : "bg-white hover:bg-[#fafafc] border-[#e5e5ea] shadow-xs"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#1d1d1f]">
                    <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>{funcion.horaInicio}</span>
                    <span className="text-[11px] font-normal text-[#86868b]">
                      - {funcion.horaFin}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#0071e3] flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6e6e73] pt-1 border-t border-[#f0f0f0]">
                  <span className="flex items-center gap-1 font-medium text-[#1d1d1f] truncate">
                    <Armchair className="w-3 h-3 text-[#0284c7]" />
                    {funcion.sala?.nombre || "Sala"}
                  </span>
                  <span className="font-bold text-[#0071e3] whitespace-nowrap">
                    {formatPrice(funcion.precioAsientoOficial)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Top Header & Poster Details */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-28 sm:w-36 flex-shrink-0 rounded-appleMd overflow-hidden border border-[#e0e0e0] shadow-md bg-[#f5f5f7]">
            <img
              src={
                pelicula.posterUrl ||
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"
              }
              alt={pelicula.titulo}
              className="w-full h-auto object-cover aspect-[2/3]"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {pelicula.clasificacion && (
                <Badge variant="dark">{pelicula.clasificacion}</Badge>
              )}
              {pelicula.genero && (
                <Badge variant="tertiary">{pelicula.genero}</Badge>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight leading-tight">
              {pelicula.titulo}
            </h2>

            <div className="flex items-center gap-4 text-[13px] text-[#86868b]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>{pelicula.duracionMinutos} minutos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Experiencia Sensorial</span>
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-[12px] text-[#6e6e73] leading-relaxed line-clamp-3 pt-1">
              {pelicula.sinopsis || "Sinopsis no disponible."}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/menu/${pelicula.id}`);
              }}
              className="inline-flex items-center gap-2 mt-2 px-3.5 py-2 rounded-applePill bg-[#f0f6ff] text-[#0071e3] text-[12px] font-semibold hover:bg-[#e1efff] transition-colors"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Ver experiencia gastronómica
            </button>
          </div>
        </div>

        {/* Section: Available Showtimes (HU-05) */}
        <div className="pt-4 border-t border-[#f0f0f0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0071e3]" />
              <h3 className="text-[14px] font-bold text-[#1d1d1f] tracking-tight">
                Funciones y Horarios Disponibles
              </h3>
            </div>
            {funciones.length > 0 && (
              <span className="text-[11px] text-[#86868b] font-medium">
                {funciones.length} función{funciones.length !== 1 ? "es" : ""} vigentes
              </span>
            )}
          </div>

          {renderFuncionesContent()}
        </div>

        {/* Action Button & Confirmation */}
        <div className="pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3">
          {selectedFuncion ? (
            <div className="text-[12px] text-[#1d1d1f]">
              <span>Seleccionado: </span>
              <strong>
                {formatTabDate(selectedDate)} a las {selectedFuncion.horaInicio}
              </strong>
              <span> en </span>
              <strong>{selectedFuncion.sala?.nombre}</strong>
              <span> (</span>
              <span className="text-[#0071e3] font-semibold">
                {formatPrice(selectedFuncion.precioAsientoOficial)}
              </span>
              <span>)</span>
            </div>
          ) : (
            <div className="text-[12px] text-[#86868b]">
              {funciones.length > 0
                ? "Selecciona un horario para continuar"
                : "No hay funciones seleccionables"}
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button variant="secondary" size="sm" onClick={onClose} className="px-4">
              Cerrar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedFuncion}
              onClick={() => {
                if (selectedFuncion) {
                  navigate("/reservas/asientos", {
                    state: { pelicula, funcion: selectedFuncion },
                  });
                }
              }}
              className="px-5 bg-[#0071e3] hover:bg-[#0077ed]"
            >
              Seleccionar Butacas
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
