import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    CreditCard, 
    Film, 
    Calendar, 
    Clock, 
    Armchair, 
    AlertCircle, 
    User, 
    CheckCircle2, 
    UtensilsCrossed 
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "../../../shared/components/Button";
import { Pelicula } from "@/features/catalogo/types";
import { Asiento, AsientoDetalleReserva } from "../types";
import { PasarelaPagoModal } from "../../pagos/components/PasarelaPagoModal";
import { useState } from "react";

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
    asientosDetalle?: AsientoDetalleReserva[];
    alergias?: string[];
}

export function ResumenReservaPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const state = useLocation().state as LocationState | null;
    const [isPasarelaOpen, setIsPasarelaOpen] = useState(false);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!state || !state.selectedAsientos) return <Navigate to="/" replace />;

    const { pelicula, funcion, selectedAsientos, asientosDetalle, alergias = [] } = state;

    // Normalizar detalles por asiento si provienen de asientosDetalle o fallback
    const comensales: AsientoDetalleReserva[] = asientosDetalle && asientosDetalle.length > 0
        ? asientosDetalle
        : selectedAsientos.map(asiento => ({
            asiento,
            nombrePersona: "Comensal",
            tieneAlergias: alergias.length > 0,
            alergias: alergias,
        }));

    const precioTotal = selectedAsientos.length * Number(funcion.precioAsientoOficial);
    const comensalesConRestriccion = comensales.filter(c => c.tieneAlergias && c.alergias.length > 0);

    const handlePagar = () => {
        setIsPasarelaOpen(true);
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
        <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a datos de comensales
            </button>

            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                    Resumen de tu Reserva
                </h1>
                <p className="text-[14px] text-[#86868b]">
                    Revisa las butacas, comensales y el menú personalizado antes de proceder con el pago.
                </p>
            </div>

            <div className="bg-white border border-[#e5e5ea] rounded-appleLg shadow-xs overflow-hidden">
                {/* Detalles de la Película y Función */}
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
                    
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-applePill">
                                Menú Sensorial Incluido
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-[#1d1d1f]">{pelicula.titulo}</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-[13px] text-[#6e6e73]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#0071e3]" />
                                <span className="capitalize">{formatDate(funcion.fecha)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#0071e3]" />
                                <span>{funcion.horaInicio} - {funcion.horaFin}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Armchair className="w-4 h-4 text-[#0071e3]" />
                                <span>{funcion.sala?.nombre || "Sala Estándar"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalles de Comensales y Butacas Individuales */}
                <div className="p-6 border-b border-[#f0f0f0] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base text-[#1d1d1f] flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-[#0071e3]" />
                            Asignación de Butacas y Experiencia Gastronómica
                        </h3>
                        <span className="text-xs text-[#86868b] font-medium">
                            {comensales.length} {comensales.length === 1 ? "butaca" : "butacas"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {comensales.map((comensal) => (
                            <div 
                                key={comensal.asiento.id} 
                                className="p-4 rounded-appleMd border border-[#e5e5ea] bg-[#fafafc] flex flex-col justify-between gap-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-appleMd bg-[#0071e3]/10 text-[#0071e3] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                            {comensal.asiento.fila}{comensal.asiento.numero}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#0071e3]" />
                                                <span>{comensal.nombrePersona}</span>
                                            </div>
                                            <span className="text-[11px] text-[#86868b]">
                                                Fila {comensal.asiento.fila} · Butaca {comensal.asiento.numero}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-[#ebebee]">
                                    {comensal.tieneAlergias && comensal.alergias.length > 0 ? (
                                        <div className="space-y-1.5">
                                            <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                                Restricciones para cocina:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {comensal.alergias.map((al, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-applePill text-[11px] font-medium"
                                                    >
                                                        {al}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-applePill border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Menú sensorial estándar (Sin restricciones)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Aviso si hay restricciones para cocina */}
                    {comensalesConRestriccion.length > 0 && (
                        <div className="flex items-start gap-2.5 p-3 rounded-appleMd bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p>
                                <strong>Aviso para cocina:</strong> Se adaptarán platos especiales para {comensalesConRestriccion.length} comensal(es). El equipo gastronómico coordinará la entrega en las butacas indicadas.
                            </p>
                        </div>
                    )}
                </div>

                {/* Resumen Financiero */}
                <div className="p-6 bg-[#fafafc] space-y-4">
                    <div className="flex justify-between text-[14px] text-[#6e6e73]">
                        <span>Entradas con Experiencia Gastronómica ({selectedAsientos.length} x {formatPrice(funcion.precioAsientoOficial)})</span>
                        <span>{formatPrice(precioTotal)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-[#e5e5ea]">
                        <div>
                            <span className="text-[16px] font-medium text-[#1d1d1f] block">Total a pagar</span>
                            <span className="text-xs text-[#86868b]">Incluye proyección y platos por comensal</span>
                        </div>
                        <span className="text-2xl font-bold text-[#0071e3]">{formatPrice(precioTotal)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
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

            {/* Modal de Pasarela de Pagos (HU-12 & HU-13) */}
            <PasarelaPagoModal
                isOpen={isPasarelaOpen}
                onClose={() => setIsPasarelaOpen(false)}
                totalPagar={precioTotal}
                peliculaTitulo={pelicula.titulo}
                detallesCompra={{
                    fecha: formatDate(funcion.fecha),
                    hora: `${funcion.horaInicio} - ${funcion.horaFin}`,
                    sala: funcion.sala?.nombre || "Sala Estándar",
                    asientosCount: selectedAsientos.length,
                }}
            />
        </div>
    );
}
