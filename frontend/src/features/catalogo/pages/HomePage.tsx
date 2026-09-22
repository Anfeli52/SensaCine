import { useState } from "react";
import { usePeliculasActivas } from "../hooks/usePeliculas";
import { Pelicula } from "../types";
import { HeroBanner } from "../components/HeroBanner";
import { MovieGrid } from "../components/MovieGrid";
import { MovieModal } from "../components/MovieModal";
import { Spinner } from "../../../shared/components/Spinner";
import { Button } from "../../../shared/components/Button";
import { AlertCircle } from "lucide-react";

export function HomePage() {
  const { data: peliculas, isLoading, isError, refetch } = usePeliculasActivas();
  const [selectedMovie, setSelectedMovie] = useState<Pelicula | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <p className="text-[13px] text-[#86868b]">Cargando cartelera...</p>
      </div>
    );
  }

  if (isError || !peliculas) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-applePill bg-red-50 flex items-center justify-center text-red-500 mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-[#1d1d1f] mb-1">No se pudo cargar la cartelera</h2>
        <p className="text-[13px] text-[#86868b] max-w-md mb-5">
          Verifica que el servidor backend esté en ejecución en el puerto 3000.
        </p>
        <Button variant="primary" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const totalPages = Math.ceil(peliculas.length / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const currentMovies = peliculas.slice(startIndex, endIndex);
  // Feature the first movie in the spotlight banner
  const featuredMovie = peliculas.length > 0 ? peliculas[0] : undefined;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <HeroBanner
        featuredMovie={featuredMovie}
        onSelectMovie={(p) => setSelectedMovie(p)}
      />

      {/* Movies Grid with Filters & Search */}
      <MovieGrid
        peliculas={currentMovies}
        onSelectMovie={(p) => setSelectedMovie(p)}
      />

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="rounded-xl border border-[#e0e0e0] px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 rounded-xl text-sm font-medium transition ${currentPage === page
                    ? "bg-[#0071e3] text-white"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-[#e0e0e0] px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Detailed Modal on Movie Click */}
      <MovieModal
        pelicula={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
