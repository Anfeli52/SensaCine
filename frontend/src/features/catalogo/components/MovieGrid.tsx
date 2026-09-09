import { useState, useMemo } from "react";
import { Pelicula } from "../types";
import { MovieCard } from "./MovieCard";
import { GenreFilter } from "./GenreFilter";
import { Search } from "lucide-react";
import { useDebounce } from "../../../shared/hooks/useDebounce";

interface MovieGridProps {
  peliculas: Pelicula[];
  onSelectMovie: (pelicula: Pelicula) => void;
}

export function MovieGrid({ peliculas, onSelectMovie }: MovieGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const debouncedSearch = useDebounce(searchTerm, 250);

  // Extract unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    set.add("Todos");
    peliculas.forEach((p) => {
      if (p.genero) {
        p.genero.split("/").forEach((g) => set.add(g.trim()));
      }
    });
    return Array.from(set);
  }, [peliculas]);

  // Filter movies by search term and genre
  const filteredPeliculas = useMemo(() => {
    return peliculas.filter((p) => {
      const matchesSearch =
        p.titulo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.sinopsis && p.sinopsis.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesGenre =
        selectedGenre === "Todos" ||
        (p.genero && p.genero.toLowerCase().includes(selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    });
  }, [peliculas, debouncedSearch, selectedGenre]);

  return (
    <div className="space-y-6" id="peliculas">
      {/* Header Bar: Title + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
            Cartelera
          </h2>
          <p className="text-[13px] text-[#86868b] mt-0.5">
            {filteredPeliculas.length} títulos disponibles en salas.
          </p>
        </div>

        {/* Apple Style Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar película..."
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-applePill py-2 pl-9 pr-4 text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] transition-all"
          />
        </div>
      </div>

      {/* Genre Filter Chips */}
      <GenreFilter
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
      />

      {/* Grid of Movies */}
      {filteredPeliculas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredPeliculas.map((pelicula) => (
            <MovieCard
              key={pelicula.id}
              pelicula={pelicula}
              onClick={() => onSelectMovie(pelicula)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f5f5f7] rounded-appleLg border border-[#e0e0e0] space-y-2">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">No se encontraron películas</h3>
          <p className="text-[13px] text-[#86868b] max-w-sm mx-auto">
            Intenta con otro término de búsqueda o género.
          </p>
        </div>
      )}
    </div>
  );
}
