import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, UtensilsCrossed } from "lucide-react";

import { usePelicula } from "../../catalogo/hooks/usePeliculas";
import { useMenu } from "../hooks/useMenu";
import { MenuGrid } from "../components/MenuGrid";
import { Spinner } from "../../../shared/components/Spinner";
import { Button } from "../../../shared/components/Button";

export function MenuPage() {
  const { peliculaId } = useParams<{ peliculaId: string }>();
  const navigate = useNavigate();

  const idPelicula = Number(peliculaId);

  const { data: pelicula, isLoading: isLoadingPelicula, isError: isErrorPelicula,} = usePelicula(idPelicula);
  const { data: productos, isLoading: isLoadingMenu, isError: isErrorMenu,} = useMenu(idPelicula);

  const isLoading = isLoadingPelicula || isLoadingMenu;
  const isError = isErrorPelicula || isErrorMenu;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <p className="text-[13px] text-[#86868b]">
          Cargando experiencia gastronómica...
        </p>
      </div>
    );
  }

  if (isError || !pelicula || !productos) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-applePill bg-red-50 flex items-center justify-center text-red-500 mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>

        <h2 className="text-lg font-bold text-[#1d1d1f] mb-1">
          No se pudo cargar el menú
        </h2>

        <p className="text-[13px] text-[#86868b] max-w-md mb-5">
          No fue posible obtener la experiencia gastronómica de esta película.
        </p>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/")}
        >
          Volver a cartelera
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-[#86868b] hover:text-[#0071e3] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <UtensilsCrossed className="w-5 h-5 text-[#0071e3]" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0071e3]">
            Experiencia gastronómica
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
          {pelicula.titulo}
        </h1>

        <p className="mt-2 text-[15px] text-[#86868b] max-w-2xl">
          El menú está organizado en el orden en que 
          disfrutarás cada momento durante la función.
        </p>
      </div>

      <MenuGrid productos={productos} />
    </div>
  );
}