import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Film, Calendar, Clock, Armchair, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "../../../shared/components/Button";
import { Pelicula } from "@/features/catalogo/types";
import { Asiento } from "../types";

interface FuncionState {
    id: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    precioAsientoOficial: number;
    idSala: number;
    sala?: { id?: number; nombre?: string };
}

interface LocationState {
    pelicula: Pelicula;
    funcion: FuncionState;
    selectedAsientos: Asiento[];
    alergias: string[];
}

export function ResumenReservaPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const state = useLocation().state as LocationState | null;

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!state) return <Navigate to="/" replace />;

    const { pelicula, funcion, selectedAsientos, alergias } = state;

    const precioTotal = selectedAsientos.length * funcion.precioAsientoOficial;

    const handlePagar = () => {
        alert("¡Redirigiendo a pasarela de pagos (Próximamente)!");
        navigate("/");
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString("es-CO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a alérgenos
            </button>

            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                    Resumen de tu Reserva
                </h1>
                <p className="text-[14px] text-[#86868b]">
                    Revisa los detalles de tu reserva antes de proceder con el pago.
                </p>
            </div>

            <div className="bg-white border border-[#e5e5ea] rounded-appleLg shadow-xs overflow-hidden">
                {/* Detalles de la Película */}
                <div className="p-6 border-b border-[#f0f0f0] flex flex-col sm:flex-row gap-5 items-start">
                    {pelicula.posterUrl ? (
                        <img 
                            src={pelicula.posterUrl} 
                            alt={pelicula.titulo} 
                            className="w-24 h-auto rounded-appleMd object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-24 h-36 bg-gray-100 rounded-appleMd flex items-center justify-center">
                            <Film className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-[#1d1d1f]">{pelicula.titulo}</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-[14px] text-[#6e6e73]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#0071e3]" />
                                <span className="capitalize">{formatDate(funcion.fecha)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#0071e3]" />
                                <span>{funcion.horaInicio}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Armchair className="w-4 h-4 text-[#0071e3]" />
                                <span>{funcion.sala?.nombre || "Sala Estándar"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalles de los Asientos */}
                <div className="p-6 border-b border-[#f0f0f0] space-y-3">
                    <h3 className="font-semibold text-[#1d1d1f]">Asientos Seleccionados</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedAsientos.map(asiento => (
                            <span 
                                key={asiento.id} 
                                className="px-3 py-1 bg-[#f5f5f7] border border-[#e5e5ea] rounded-applePill text-[13px] font-medium text-[#1d1d1f]"
                            >
                                Fila {asiento.fila} - Asiento {asiento.numero}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Detalles de Alergias */}
                <div className="p-6 border-b border-[#f0f0f0] space-y-3">
                    <h3 className="font-semibold text-[#1d1d1f] flex items-center gap-2">
                        Alérgenos registrados
                    </h3>
                    {alergias.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {alergias.map((alergia, idx) => (
                                <span 
                                    key={idx} 
                                    className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-applePill text-[13px] font-medium flex items-center gap-1.5"
                                >
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {alergia}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[14px] text-[#6e6e73]">Ninguna alergia o intolerancia reportada.</p>
                    )}
                </div>

                {/* Resumen Financiero */}
                <div className="p-6 bg-[#fafafc] space-y-4">
                    <div className="flex justify-between text-[14px] text-[#6e6e73]">
                        <span>Entradas ({selectedAsientos.length} x {formatPrice(funcion.precioAsientoOficial)})</span>
                        <span>{formatPrice(precioTotal)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-[#e5e5ea]">
                        <span className="text-[16px] font-medium text-[#1d1d1f]">Total a pagar</span>
                        <span className="text-2xl font-bold text-[#0071e3]">{formatPrice(precioTotal)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handlePagar}
                    className="px-8 w-full sm:w-auto"
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceder al Pago
                </Button>
            </div>
        </div>
    );
}
