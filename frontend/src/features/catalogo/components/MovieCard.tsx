import { Pelicula } from "../types";
import { Badge } from "../../../shared/components/Badge";
import { Clock } from "lucide-react";

interface MovieCardProps {
  pelicula: Pelicula;
  onClick: () => void;
}

export function MovieCard({ pelicula, onClick }: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col rounded-appleLg overflow-hidden bg-white border border-[#e0e0e0] hover:border-[#0071e3]/40 transition-all duration-200 hover:-translate-y-1 shadow-appleCard hover:shadow-appleCardHover"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#f5f5f7]">
        <img
          src={
            pelicula.posterUrl ||
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"
          }
          alt={pelicula.titulo}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Top Badges */}
        {pelicula.clasificacion && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <Badge variant="dark" size="sm">
              {pelicula.clasificacion}
            </Badge>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1">
          {pelicula.genero && (
            <p className="text-[11px] font-normal text-[#86868b] line-clamp-1">
              {pelicula.genero}
            </p>
          )}
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight leading-snug group-hover:text-[#0071e3] transition-colors line-clamp-2">
            {pelicula.titulo}
          </h3>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-[#f0f0f0] flex items-center justify-between text-[12px] text-[#86868b]">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#86868b]" />
            <span>{pelicula.duracionMinutos} min</span>
          </div>

          <span className="font-semibold text-[#0071e3] text-[13px]">
            ${pelicula.precioBaseExperiencia.toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </div>
  );
}
