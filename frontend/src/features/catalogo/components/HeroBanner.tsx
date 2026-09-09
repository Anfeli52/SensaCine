import { Pelicula } from "../types";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { Clock } from "lucide-react";

interface HeroBannerProps {
  featuredMovie?: Pelicula;
  onSelectMovie: (pelicula: Pelicula) => void;
}

export function HeroBanner({ featuredMovie, onSelectMovie }: HeroBannerProps) {
  if (!featuredMovie) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-appleXl bg-[#f5f5f7] border border-[#e0e0e0] mb-12">
      <div className="p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Photography / Poster with signature Apple drop shadow */}
        <div className="w-48 sm:w-56 lg:w-60 flex-shrink-0 group">
          <div className="relative rounded-appleLg overflow-hidden border border-black/5 shadow-[0_12px_32px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-[1.02]">
            <img
              src={featuredMovie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"}
              alt={featuredMovie.titulo}
              className="w-full h-auto object-cover aspect-[2/3]"
              loading="eager"
            />
          </div>
        </div>

        {/* Text & Meta Information */}
        <div className="flex-1 space-y-3.5 text-center lg:text-left">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <Badge variant="primary">Destacada</Badge>
            {featuredMovie.clasificacion && (
              <Badge variant="neutral">{featuredMovie.clasificacion}</Badge>
            )}
            {featuredMovie.genero && (
              <Badge variant="tertiary">{featuredMovie.genero}</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1d1d1f] tracking-tight leading-[1.08]">
            {featuredMovie.titulo}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-center lg:justify-start gap-3 text-[13px] text-[#6e6e73]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {featuredMovie.duracionMinutos} min
            </span>
            <span>•</span>
            <span className="text-[#1d1d1f] font-semibold">
              ${featuredMovie.precioBaseExperiencia.toLocaleString("es-CO")} COP
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-[14px] text-[#6e6e73] max-w-2xl leading-relaxed line-clamp-3">
            {featuredMovie.sinopsis || "Disfruta de la mejor experiencia cinematográfica en cartelera."}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => onSelectMovie(featuredMovie)}
            >
              Ver Detalles
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onSelectMovie(featuredMovie)}
            >
              Más Información
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
