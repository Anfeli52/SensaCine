import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePelicula } from "../../catalogo/hooks/usePeliculas";
import { Spinner } from "../../../shared/components/Spinner";
import { useResenasPorPelicula } from "../../resenas/hooks/useResenas";
import { Star, MessageSquare, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "../../../shared/components/Button";

export function ResenasPage() {
    const { peliculaId } = useParams();
    const navigate = useNavigate();

    const idPelicula = Number(peliculaId);
    const [limiteResenas, setLimiteResenas] = useState(5);

    const { data: pelicula, isLoading: isLoadingPelicula, isError: isErrorPelicula, } = usePelicula(idPelicula);
    const { data: datosResenas, isLoading: isLoadingResenas, isError: isErrorResenas } = useResenasPorPelicula(pelicula?.id);
    const resenasVisibles = datosResenas?.resenas.slice(0, limiteResenas) ?? [];
    const hayMasResenas = limiteResenas < (datosResenas?.resenas.length ?? 0);
    const isLoading = isLoadingPelicula || isLoadingResenas
    const isError = isErrorPelicula || isErrorResenas;

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

    if (isError || !pelicula || !datosResenas) {
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

    const renderEstrellas = (calificacion: number) => (
        <div className="flex items-center gap-0.5" aria-label={`${calificacion} de 5 estrellas`}>
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    className={`w-3.5 h-3.5 ${index < calificacion
                        ? "fill-[#e5a000] text-[#e5a000]"
                        : "text-[#d2d2d7]"
                        }`}
                />
            ))}
        </div>
    );

    const renderResenasContent = () => {
        if (isLoadingResenas) {
            return (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <p className="text-[12px] text-[#86868b]">
                        Cargando opiniones de los asistentes...
                    </p>
                </div>
            );
        }

        if (isErrorResenas) {
            return (
                <div className="py-6 text-center bg-[#fafafc] rounded-appleLg border border-[#e5e5ea]">
                    <p className="text-[12px] text-[#86868b]">
                        No fue posible cargar las reseñas. Inténtalo nuevamente.
                    </p>
                </div>
            );
        }

        if (!datosResenas || datosResenas.resumen.totalResenas === 0) {
            return (
                <div className="py-7 px-4 bg-[#fafafc] rounded-appleLg border border-[#e5e5ea] text-center">
                    <MessageSquare className="w-7 h-7 text-[#86868b] mx-auto mb-2 opacity-60" />
                    <h4 className="text-[13px] font-semibold text-[#1d1d1f]">
                        Esta película aún no tiene reseñas
                    </h4>
                    <p className="text-[12px] text-[#86868b] mt-1">
                        Sé uno de los primeros en compartir tu opinión sobre la película y su experiencia gastronómica.
                    </p>
                </div>
            );
        }

        const { resumen, resenas } = datosResenas;

        return (
            <div className="space-y-4">
                {/* Resumen de calificaciones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-appleLg bg-[#fafafc] border border-[#e5e5ea]">
                        <p className="text-[11px] font-medium text-[#86868b] mb-2">
                            Calificación de la película
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#1d1d1f]">
                                {resumen.promedioPelicula?.toFixed(1)}
                            </span>
                            <span className="text-[11px] text-[#86868b]">/ 5</span>
                        </div>

                        {renderEstrellas(Math.round(resumen.promedioPelicula ?? 0))}
                    </div>

                    <div className="p-4 rounded-appleLg bg-[#fafafc] border border-[#e5e5ea]">
                        <p className="text-[11px] font-medium text-[#86868b] mb-2">
                            Experiencia gastronómica
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#1d1d1f]">
                                {resumen.promedioExperiencia?.toFixed(1)}
                            </span>
                            <span className="text-[11px] text-[#86868b]">/ 5</span>
                        </div>

                        {renderEstrellas(Math.round(resumen.promedioExperiencia ?? 0))}
                    </div>
                </div>

                <p className="text-[11px] text-[#86868b]">
                    Reseña{resumen.totalResenas !== 1 ? "s" : ""} de asistentes:
                </p>

                {/* Listado de reseñas */}
                <div className="space-y-3">
                    {resenasVisibles.map((resena) => (
                        <div
                            key={resena.id}
                            className="p-5 rounded-2xl border border-[#e5e5ea] bg-white hover:border-[#d2d2d7] transition-colors"
                        >
                            {/* Encabezado */}
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#f0f5ff] flex items-center justify-center">
                                        <span className="text-[13px] font-semibold text-[#0071e3]">
                                            {resena.usuario.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#1d1d1f]">
                                            {resena.usuario}
                                        </h4>

                                        <p className="text-[11px] text-[#86868b] mt-0.5">
                                            {new Date(resena.fechaCreacion).toLocaleDateString("es-CO", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <MessageSquare className="w-4 h-4 text-[#c7c7cc]" />
                            </div>

                            {/* Calificaciones */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-[#f0f0f0]">
                                <div>
                                    <p className="text-[11px] font-medium text-[#86868b] mb-2">
                                        Película
                                    </p>

                                    <div className="flex items-center gap-2">
                                        {renderEstrellas(resena.calificacionPelicula)}

                                        <span className="text-[12px] font-semibold text-[#1d1d1f]">
                                            {resena.calificacionPelicula}.0
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[11px] font-medium text-[#86868b] mb-2">
                                        Experiencia gastronómica
                                    </p>

                                    <div className="flex items-center gap-2">
                                        {renderEstrellas(resena.calificacionExperiencia)}

                                        <span className="text-[12px] font-semibold text-[#1d1d1f]">
                                            {resena.calificacionExperiencia}.0
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Comentario */}
                            {resena.comentario && (
                                <p className="text-[13px] text-[#6e6e73] leading-relaxed mt-3">
                                    {resena.comentario}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Ver más reseñas */}
                {hayMasResenas && (
                    <div className="flex flex-col items-center pt-3 gap-2 ">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setLimiteResenas((actual) => actual + 5)}
                        >
                            Ver más reseñas
                        </Button>

                        <span className="text-[11px] text-[#86868b]">
                            Mostrando {resenasVisibles.length} de {datosResenas.resenas.length} reseñas
                        </span>
                    </div>
                )}
            </div>
        );
    };

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
                    <MessageSquare className="w-5 h-5 text-[#0071e3]" />
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0071e3]">
                        Calificaciones y opiniones de los asistentes
                    </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
                    {pelicula.titulo}
                </h1>
                <p className="mt-2 text-[15px] text-[#86868b] max-w-2xl">
                    Consulta las calificaciones y opiniones de los asistentes sobre la película y su experiencia gastronómica.
                    Descubre lo que otros espectadores piensan y comparte tu propia reseña para ayudar a otros a tomar decisiones informadas.
                </p>
            </div>
            <div className="pt-4 border-t border-[#f0f0f0] space-y-4">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#e5a000]" />
                        <h3 className="text-[14px] font-bold text-[#1d1d1f] tracking-tight">
                            Opiniones de los asistentes
                        </h3>
                    </div>

                    {datosResenas && datosResenas.resumen.totalResenas > 0 && (
                        <span className="text-[11px] text-[#86868b] font-medium">
                            {datosResenas.resumen.totalResenas} reseñas
                        </span>
                    )}
                </div>

                {renderResenasContent()}
            </div>
        </div>

    )
}