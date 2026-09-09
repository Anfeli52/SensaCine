import { Pelicula } from "../types";
import { Modal } from "../../../shared/components/Modal";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { Clock } from "lucide-react";

interface MovieModalProps {
  pelicula: Pelicula | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieModal({ pelicula, isOpen, onClose }: MovieModalProps) {
  if (!pelicula) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Top Header & Poster Details */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-32 sm:w-40 flex-shrink-0 rounded-appleMd overflow-hidden border border-[#e0e0e0] shadow-md bg-[#f5f5f7]">
            <img
              src={
                pelicula.posterUrl ||
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"
              }
              alt={pelicula.titulo}
              className="w-full h-auto object-cover aspect-[2/3]"
            />
          </div>

          <div className="flex-1 space-y-2.5">
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

            <div className="flex items-center gap-2 text-[13px] text-[#86868b]">
              <Clock className="w-3.5 h-3.5" />
              <span>{pelicula.duracionMinutos} minutos</span>
            </div>

            <div className="pt-1">
              <span className="text-[12px] text-[#86868b] block">Precio entrada</span>
              <span className="text-lg font-bold text-[#0071e3]">
                ${pelicula.precioBaseExperiencia.toLocaleString("es-CO")} COP
              </span>
            </div>
          </div>
        </div>

        {/* Synopsis Section */}
        <div className="space-y-1.5 pt-3 border-t border-[#f0f0f0]">
          <h4 className="text-[12px] font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Sinopsis
          </h4>
          <p className="text-[13px] text-[#6e6e73] leading-relaxed">
            {pelicula.sinopsis || "No hay sinopsis disponible actualmente para este título."}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              alert(`Seleccionaste ${pelicula.titulo}. El módulo de reservas estará disponible próximamente.`);
            }}
          >
            Seleccionar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
