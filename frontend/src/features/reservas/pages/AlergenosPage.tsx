import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    AlertTriangle, 
    Check, 
    Copy, 
    Armchair, 
    ChevronLeft, 
    ChevronRight,
    UserCheck
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "../../../shared/components/Button";
import { Asiento, AsientoDetalleReserva } from "../types";
import { Pelicula } from "@/features/catalogo/types";
import { BloqueoTimer } from "../components/BloqueoTimer";
import { liberarAsientos } from "../api/bookingApi";
import { useBloqueoStore } from "../bloqueoStore";
import { useRestaurarBloqueo } from "../hooks/useRestaurarBloqueo";
import { Spinner } from "../../../shared/components/Spinner";

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
}

const ALERGIAS_PREDEFINIDAS = [
    "Maní",
    "Gluten",
    "Lácteos",
    "Mariscos",
    "Huevos",
    "Frutos Secos",
    "Pescado",
    "Soja",
];

interface AsientoFormState {
    asiento: Asiento;
    nombrePersona: string;
    tieneAlergias: boolean | null;
    alergiasSeleccionadas: string[];
    otraAlergia: string;
}

export function AlergenosPage() {
    const { isAuthenticated, usuario } = useAuthStore();
    const navigate = useNavigate();
    const locationState = useLocation().state as LocationState | null;
    const bloqueo = useBloqueoStore((s) => s.bloqueo);
    const clearBloqueo = useBloqueoStore((s) => s.clear);
    const verificando = useRestaurarBloqueo(
        locationState?.funcion.id,
        locationState?.selectedAsientos?.map((a) => a.id)
    );

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!locationState || !locationState.selectedAsientos || locationState.selectedAsientos.length === 0) {
        return <Navigate to="/" replace />;
    }

    const { pelicula, funcion, selectedAsientos } = locationState;

    const [asientosConfig, setAsientosConfig] = useState<AsientoFormState[]>(() => {
        return selectedAsientos.map((asiento, index) => ({
            asiento,
            nombrePersona: index === 0 && usuario?.nombre ? usuario.nombre : "",
            tieneAlergias: null,
            alergiasSeleccionadas: [],
            otraAlergia: "",
        }));
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const [copiadoFeedback, setCopiadoFeedback] = useState(false);

    const current = asientosConfig[activeIndex] || asientosConfig[0];

    const updateCurrent = (partial: Partial<AsientoFormState>) => {
        setAsientosConfig(prev =>
            prev.map((item, idx) => (idx === activeIndex ? { ...item, ...partial } : item))
        );
    };

    const handleCheckboxChange = (alergia: string) => {
        const prev = current.alergiasSeleccionadas;
        const updated = prev.includes(alergia)
            ? prev.filter(a => a !== alergia)
            : [...prev, alergia];
        updateCurrent({ alergiasSeleccionadas: updated });
    };

    const handleCopiarRestriccionesATodos = () => {
        if (current.tieneAlergias === null) return;
        setAsientosConfig(prev =>
            prev.map((item, idx) => {
                if (idx === activeIndex) return item;
                return {
                    ...item,
                    tieneAlergias: current.tieneAlergias,
                    alergiasSeleccionadas: [...current.alergiasSeleccionadas],
                    otraAlergia: current.otraAlergia,
                };
            })
        );
        setCopiadoFeedback(true);
        setTimeout(() => setCopiadoFeedback(false), 2500);
    };

    const isSeatValid = (cfg: AsientoFormState) => {
        if (!cfg.nombrePersona.trim()) return false;
        if (cfg.tieneAlergias === null) return false;
        if (cfg.tieneAlergias === true) {
            if (cfg.alergiasSeleccionadas.length === 0) return false;
            if (cfg.alergiasSeleccionadas.includes("Otro") && !cfg.otraAlergia.trim()) return false;
        }
        return true;
    };

    const allValid = asientosConfig.every(isSeatValid);
    const validCount = asientosConfig.filter(isSeatValid).length;

    const handleContinuar = () => {
        if (!allValid) return;

        const asientosDetalle: AsientoDetalleReserva[] = asientosConfig.map(cfg => {
            const alergiasFinales = cfg.tieneAlergias
                ? cfg.alergiasSeleccionadas.map(a => (a === "Otro" ? cfg.otraAlergia.trim() : a))
                : [];
            return {
                asiento: cfg.asiento,
                nombrePersona: cfg.nombrePersona.trim(),
                tieneAlergias: !!cfg.tieneAlergias,
                alergias: alergiasFinales,
                otraAlergia: cfg.otraAlergia.trim(),
            };
        });

        const todasLasAlergias = Array.from(
            new Set(asientosDetalle.flatMap(d => d.alergias))
        );

        navigate("/reservas/resumen", {
            state: {
                pelicula,
                funcion,
                selectedAsientos,
                asientosDetalle,
                alergias: todasLasAlergias,
            },
        });
    };

    if (verificando) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <Spinner size="md" />
                <p className="text-[13px] text-[#86868b]">Recuperando tu reserva...</p>
            </div>
        );
    }

    if (bloqueo?.idFuncion !== funcion.id) {
        return (
            <Navigate
                to="/reservas/asientos"
                replace
                state={{ pelicula, funcion, aviso: "Tus asientos ya no están reservados temporalmente. Selecciónalos de nuevo." }}
            />
        );
    }

    const handleVolver = async () => {
        await liberarAsientos(funcion.id).catch(() => undefined);
        clearBloqueo();
        navigate("/reservas/asientos", { state: { pelicula, funcion } });
    };

    return (
        <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
                type="button"
                onClick={handleVolver}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a selección de asientos
            </button>

            <BloqueoTimer idFuncion={funcion.id} />

            {/* Cabecera Principal */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
                    <span>Experiencia Sensorial y Gastronómica</span>
                    <span>·</span>
                    <span>{pelicula.titulo}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                    Comensales y Restricciones Alimentarias
                </h1>
                <p className="text-[14px] text-[#86868b] max-w-2xl">
                    En SensaCine servimos platos individuales durante la proyección. Indícanos el nombre de cada persona y si tiene alguna restricción alimentaria para que cocina prepare su menú de forma personalizada.
                </p>
            </div>

            {/* Selector / Pestañas de Butacas */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#86868b]">
                    <span>Selecciona una butaca para configurar sus datos:</span>
                    <span className="font-medium text-[#1d1d1f]">
                        {validCount} de {asientosConfig.length} completados
                    </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {asientosConfig.map((cfg, idx) => {
                        const complete = isSeatValid(cfg);
                        const active = idx === activeIndex;
                        return (
                            <button
                                key={cfg.asiento.id}
                                type="button"
                                onClick={() => setActiveIndex(idx)}
                                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-appleMd text-xs font-semibold whitespace-nowrap transition-all border ${
                                    active
                                        ? "bg-[#0071e3] text-white border-[#0071e3] shadow-xs scale-[1.02]"
                                        : complete
                                        ? "bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:border-emerald-400"
                                        : "bg-white text-[#6e6e73] border-[#e5e5ea] hover:border-[#0071e3]/40 hover:bg-[#fafafc]"
                                }`}
                            >
                                <Armchair className={`w-3.5 h-3.5 ${active ? "text-white" : complete ? "text-emerald-600" : "text-[#86868b]"}`} />
                                <span>Butaca {cfg.asiento.fila}{cfg.asiento.numero}</span>
                                {cfg.nombrePersona.trim() && (
                                    <span className={`text-[11px] font-normal truncate max-w-[85px] ${active ? "text-white/80" : "text-[#86868b]"}`}>
                                        ({cfg.nombrePersona.trim()})
                                    </span>
                                )}
                                {complete ? (
                                    <Check className={`w-3.5 h-3.5 ml-0.5 ${active ? "text-white" : "text-emerald-600"}`} />
                                ) : (
                                    <span className={`w-1.5 h-1.5 rounded-full ml-0.5 ${active ? "bg-white/70" : "bg-amber-400"}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tarjeta del Asiento Activo */}
            <div className="bg-white border border-[#e5e5ea] rounded-appleLg shadow-xs p-5 sm:p-8 space-y-6 animate-in fade-in duration-200">
                {/* Encabezado del Asiento */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f0] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-appleMd bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold text-base">
                            {current.asiento.fila}{current.asiento.numero}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2">
                                Butaca {current.asiento.fila}{current.asiento.numero}
                                {isSeatValid(current) && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-applePill border border-emerald-200">
                                        <Check className="w-3 h-3" /> Datos completos
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-[#86868b]">
                                Fila {current.asiento.fila} · Asiento {current.asiento.numero} · {funcion.sala?.nombre || "Sala"}
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-applePill bg-gray-100 text-[#6e6e73] self-start sm:self-auto">
                        Comensal {activeIndex + 1} de {asientosConfig.length}
                    </span>
                </div>

                {/* 1. Nombre de la Persona */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1d1d1f]">
                        Nombre de la persona <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-[#86868b]">
                        Identifica a la persona que ocupará esta butaca para que cocina sirva su plato correspondiente.
                    </p>
                    <input
                        type="text"
                        placeholder="Ej. Andrés Pérez"
                        value={current.nombrePersona}
                        onChange={(e) => updateCurrent({ nombrePersona: e.target.value })}
                        className="w-full rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-4 py-2.5 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#a1a1a6] focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
                    />
                </div>

                {/* 2. Pregunta de Restricciones */}
                <div className="space-y-3 pt-2">
                    <label className="block text-sm font-semibold text-[#1d1d1f]">
                        Restricción alimentaria para esta persona <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label 
                            className={`flex items-start gap-3 p-4 border rounded-appleMd cursor-pointer transition-all ${
                                current.tieneAlergias === false 
                                    ? 'border-[#0071e3] bg-[#f5f9ff] ring-2 ring-[#0071e3]/20' 
                                    : 'border-[#e5e5ea] hover:bg-gray-50'
                            }`}
                        >
                            <input 
                                type="radio" 
                                name={`tieneAlergias-${current.asiento.id}`}
                                checked={current.tieneAlergias === false}
                                onChange={() => updateCurrent({ tieneAlergias: false, alergiasSeleccionadas: [], otraAlergia: "" })}
                                className="mt-1 w-4 h-4 text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                            />
                            <div>
                                <span className="block font-medium text-sm text-[#1d1d1f]">Sin restricciones</span>
                                <span className="block text-xs text-[#86868b] mt-0.5">
                                    Disfrutará del menú sensorial estándar sin modificaciones.
                                </span>
                            </div>
                        </label>

                        <label 
                            className={`flex items-start gap-3 p-4 border rounded-appleMd cursor-pointer transition-all ${
                                current.tieneAlergias === true 
                                    ? 'border-[#0071e3] bg-[#f5f9ff] ring-2 ring-[#0071e3]/20' 
                                    : 'border-[#e5e5ea] hover:bg-gray-50'
                            }`}
                        >
                            <input 
                                type="radio" 
                                name={`tieneAlergias-${current.asiento.id}`}
                                checked={current.tieneAlergias === true}
                                onChange={() => updateCurrent({ tieneAlergias: true })}
                                className="mt-1 w-4 h-4 text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                            />
                            <div>
                                <span className="block font-medium text-sm text-[#1d1d1f]">Tiene alergias o restricciones</span>
                                <span className="block text-xs text-[#86868b] mt-0.5">
                                    Indicar los alérgenos para adaptar sus platos individuales.
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Selección de Alérgenos Individual */}
                {current.tieneAlergias === true && (
                    <div className="pt-4 border-t border-[#f0f0f0] space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h3 className="font-semibold text-sm text-[#1d1d1f]">
                                Selecciona los alérgenos o restricciones para {current.nombrePersona.trim() || `Butaca ${current.asiento.fila}${current.asiento.numero}`}:
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {ALERGIAS_PREDEFINIDAS.map(alergia => {
                                const checked = current.alergiasSeleccionadas.includes(alergia);
                                return (
                                    <label 
                                        key={alergia} 
                                        className={`flex items-center gap-2 p-2.5 border rounded-appleMd cursor-pointer transition-all text-xs ${
                                            checked 
                                                ? "border-[#0071e3] bg-[#f5f9ff] font-medium text-[#0071e3]" 
                                                : "border-[#e5e5ea] text-[#1d1d1f] hover:bg-gray-50"
                                        }`}
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleCheckboxChange(alergia)}
                                            className="w-3.5 h-3.5 rounded text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                                        />
                                        <span>{alergia}</span>
                                    </label>
                                );
                            })}
                            <label 
                                className={`flex items-center gap-2 p-2.5 border rounded-appleMd cursor-pointer transition-all text-xs ${
                                    current.alergiasSeleccionadas.includes("Otro") 
                                        ? "border-[#0071e3] bg-[#f5f9ff] font-medium text-[#0071e3]" 
                                        : "border-[#e5e5ea] text-[#1d1d1f] hover:bg-gray-50"
                                }`}
                            >
                                <input 
                                    type="checkbox"
                                    checked={current.alergiasSeleccionadas.includes("Otro")}
                                    onChange={() => handleCheckboxChange("Otro")}
                                    className="w-3.5 h-3.5 rounded text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                                />
                                <span>Otro</span>
                            </label>
                        </div>

                        {current.alergiasSeleccionadas.includes("Otro") && (
                            <div className="pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                                    Por favor especifica la otra alergia o intolerancia:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. Sésamo, Fresas, Mostaza, etc."
                                    value={current.otraAlergia}
                                    onChange={(e) => updateCurrent({ otraAlergia: e.target.value })}
                                    className="w-full rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-3.5 py-2 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#a1a1a6] focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Acciones de la Tarjeta */}
                <div className="pt-4 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3">
                    {asientosConfig.length > 1 ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={handleCopiarRestriccionesATodos}
                                disabled={current.tieneAlergias === null}
                                className="inline-flex items-center gap-1.5 text-xs text-[#0071e3] hover:underline font-medium disabled:opacity-40 disabled:no-underline"
                                title="Aplica las mismas restricciones de esta butaca a las demás (manteniendo los nombres individuales)"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Copiar estas restricciones a las demás butacas
                            </button>
                            {copiadoFeedback && (
                                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-applePill animate-in fade-in duration-150">
                                    ¡Copiado a todas las butacas!
                                </span>
                            )}
                        </div>
                    ) : <div />}

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {activeIndex > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setActiveIndex(activeIndex - 1)}
                                className="px-3 text-xs"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                Anterior butaca
                            </Button>
                        )}
                        {activeIndex < asientosConfig.length - 1 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setActiveIndex(activeIndex + 1)}
                                className="px-3 text-xs"
                            >
                                Siguiente butaca
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Barra Inferior de Confirmación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg p-4 sm:p-5">
                <div className="flex items-start gap-2.5 text-[13px] text-[#86868b]">
                    <UserCheck className="w-4 h-4 text-[#0071e3] mt-0.5 flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-[#1d1d1f]">
                            {allValid
                                ? "¡Información completa para todos los comensales!"
                                : `Faltan ${asientosConfig.length - validCount} comensal(es) por completar.`}
                        </span>
                        <p className="text-xs text-[#86868b]">
                            Cada plato se servirá identificado con el nombre asignado en su respectiva butaca.
                        </p>
                    </div>
                </div>

                <Button 
                    variant="primary" 
                    size="md" 
                    disabled={!allValid} 
                    onClick={handleContinuar}
                    className="px-7 w-full sm:w-auto whitespace-nowrap"
                >
                    Continuar al resumen
                </Button>
            </div>
        </div>
    );
}
