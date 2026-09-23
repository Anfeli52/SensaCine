import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Asiento } from "../types";
import { Pelicula } from "@/features/catalogo/types";

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
];

export function AlergenosPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const state = useLocation().state as LocationState | null;

    const [tieneAlergias, setTieneAlergias] = useState<boolean | null>(null);
    const [alergiasSeleccionadas, setAlergiasSeleccionadas] = useState<string[]>([]);
    const [otraAlergia, setOtraAlergia] = useState("");

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!state) return <Navigate to="/" replace />;

    const { pelicula, funcion, selectedAsientos } = state;

    const handleCheckboxChange = (alergia: string) => {
        setAlergiasSeleccionadas(prev =>
            prev.includes(alergia)
                ? prev.filter(a => a !== alergia)
                : [...prev, alergia]
        );
    };

    const isContinuarDisabled = 
        tieneAlergias === null || 
        (tieneAlergias === true && alergiasSeleccionadas.length === 0) ||
        (tieneAlergias === true && alergiasSeleccionadas.includes("Otro") && !otraAlergia.trim());

    const handleContinuar = () => {
        const alergiasData = tieneAlergias 
            ? alergiasSeleccionadas.map(a => a === "Otro" ? otraAlergia : a)
            : [];
            
        console.log("Procediendo al pago con:", {
            pelicula,
            funcion,
            asientos: selectedAsientos,
            alergias: alergiasData
        });
        
        alert("Información de alérgenos guardada.\n" + (alergiasData.length > 0 ? "Alérgenos: " + alergiasData.join(", ") : "Sin alérgenos") + "\n\nRedirigiendo a pagos (Próximamente)...");
        navigate("/");
    };

    return (
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a selección de asientos
            </button>

            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                    Información de Alérgenos
                </h1>
                <p className="text-[14px] text-[#86868b]">
                    Para garantizar tu seguridad y brindarte la mejor experiencia, por favor indícanos si tienes alguna restricción alimentaria.
                </p>
            </div>

            <div className="bg-white border border-[#e5e5ea] rounded-appleLg shadow-xs p-5 sm:p-8 space-y-6">
                
                <div className="space-y-4">
                    <label className={`flex items-start gap-3 p-4 border rounded-appleMd cursor-pointer transition-colors ${tieneAlergias === false ? 'border-[#0071e3] bg-[#f5f9ff]' : 'border-[#e5e5ea] hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="tieneAlergias" 
                            checked={tieneAlergias === false}
                            onChange={() => setTieneAlergias(false)}
                            className="mt-1 w-4 h-4 text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                        />
                        <div>
                            <span className="block font-medium text-[#1d1d1f]">No tengo alergias ni intolerancias</span>
                            <span className="block text-sm text-[#86868b]">Puedo consumir cualquier alimento del menú sin restricciones.</span>
                        </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 border rounded-appleMd cursor-pointer transition-colors ${tieneAlergias === true ? 'border-[#0071e3] bg-[#f5f9ff]' : 'border-[#e5e5ea] hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="tieneAlergias" 
                            checked={tieneAlergias === true}
                            onChange={() => setTieneAlergias(true)}
                            className="mt-1 w-4 h-4 text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                        />
                        <div>
                            <span className="block font-medium text-[#1d1d1f]">Sí, tengo alguna alergia o intolerancia</span>
                            <span className="block text-sm text-[#86868b]">Necesito informar sobre restricciones específicas en mi alimentación.</span>
                        </div>
                    </label>
                </div>

                {tieneAlergias && (
                    <div className="pt-4 border-t border-[#f0f0f0] space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h3 className="font-semibold text-[#1d1d1f] flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Selecciona tus alergias o intolerancias:
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ALERGIAS_PREDEFINIDAS.map(alergia => (
                                <label key={alergia} className="flex items-center gap-2.5 p-3 border border-[#e5e5ea] rounded-appleMd cursor-pointer hover:bg-gray-50">
                                    <input 
                                        type="checkbox"
                                        checked={alergiasSeleccionadas.includes(alergia)}
                                        onChange={() => handleCheckboxChange(alergia)}
                                        className="w-4 h-4 rounded text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                                    />
                                    <span className="text-[14px] text-[#1d1d1f]">{alergia}</span>
                                </label>
                            ))}
                            <label className="flex items-center gap-2.5 p-3 border border-[#e5e5ea] rounded-appleMd cursor-pointer hover:bg-gray-50">
                                <input 
                                    type="checkbox"
                                    checked={alergiasSeleccionadas.includes("Otro")}
                                    onChange={() => handleCheckboxChange("Otro")}
                                    className="w-4 h-4 rounded text-[#0071e3] border-gray-300 focus:ring-[#0071e3]"
                                />
                                <span className="text-[14px] text-[#1d1d1f]">Otro</span>
                            </label>
                        </div>

                        {alergiasSeleccionadas.includes("Otro") && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Input 
                                    label="Por favor, especifica:"
                                    name="otraAlergia"
                                    placeholder="Ej. Soya, Mostaza, etc."
                                    value={otraAlergia}
                                    onChange={(e) => setOtraAlergia(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg p-4">
                <div className="flex items-center gap-2 text-[13px] text-[#86868b]">
                    <Info className="w-4 h-4" />
                    <span>Esta información se adjuntará a tu reserva y será visible para el personal de cocina.</span>
                </div>
                <Button 
                    variant="primary" 
                    size="md" 
                    disabled={isContinuarDisabled} 
                    onClick={handleContinuar}
                    className="px-6 w-full sm:w-auto"
                >
                    Continuar al pago
                </Button>
            </div>
        </div>
    );
}
