import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Armchair, Calendar, Clock } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { Pelicula } from "@/features/catalogo/types";
import { Button } from "../../../shared/components/Button";
import { Spinner } from "../../../shared/components/Spinner";
import { SeatMap } from "../components/SeatMap";
import { useAsientos, asientosQueryKey } from "../hooks/useAsientos";
import { bloquearAsientos, liberarAsientos } from "../api/bookingApi";
import { useBloqueoStore } from "../bloqueoStore";
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
    aviso?: string;
}

const MAX_SEATS = 8;

const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(price);

export function SeatSelectionPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const state = useLocation().state as LocationState | null;
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Asiento[]>([]);
    const [aviso, setAviso] = useState<string | null>(state?.aviso ?? null);
    const [isBlocking, setIsBlocking] = useState(false);
    const bloqueo = useBloqueoStore((s) => s.bloqueo);
    const setBloqueo = useBloqueoStore((s) => s.setBloqueo);
    const clearBloqueo = useBloqueoStore((s) => s.clear);
    const sincronizado = useRef(false);

    const { filas, occupiedIds, pendingIds, miBloqueo, data, isLoading, isError, isFetching, refetch } = useAsientos(
        state?.funcion.id,
        (ids) =>
            // Si otro usuario dejó pendientes u ocupó asientos que teníamos seleccionados, los quitamos y avisamos
            setSelected((prev) => {
                const perdidos = prev.filter((s) => ids.includes(s.id));
                if (perdidos.length === 0) return prev;
                setAviso(
                    `Ya no están disponibles: ${perdidos.map((p) => `${p.fila}${p.numero}`).join(", ")}`
                );
                return prev.filter((s) => !ids.includes(s.id));
            })
    );

    useEffect(() => {
        if (!data || isFetching || sincronizado.current || !state) return;
        sincronizado.current = true;
        const tengoBloqueo = !!miBloqueo || useBloqueoStore.getState().bloqueo?.idFuncion === state.funcion.id;
        if (!tengoBloqueo) return;
        clearBloqueo();
        liberarAsientos(state.funcion.id)
            .catch(() => undefined)
            .finally(() => queryClient.invalidateQueries({ queryKey: asientosQueryKey(state.funcion.id) }));
    }, [data, isFetching]);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!state) return <Navigate to="/" replace />;

    const { pelicula, funcion } = state;
    const total = selected.length * Number(funcion.precioAsientoOficial);

    const toggle = (a: Asiento) =>
        setSelected((prev) => {
            if (prev.some((s) => s.id === a.id)) return prev.filter((s) => s.id !== a.id);
            return prev.length >= MAX_SEATS ? prev : [...prev, a];
        });

    const handleContinuar = async () => {
        setIsBlocking(true);
        setAviso(null);
        try {
            if (bloqueo && bloqueo.idFuncion !== funcion.id) {
                await liberarAsientos(bloqueo.idFuncion).catch(() => undefined);
            }
            const creado = await bloquearAsientos(funcion.id, selected.map((s) => s.id));
            setBloqueo(creado.id_funcion, creado.ids_asiento, creado.segundos_restantes);
            queryClient.invalidateQueries({ queryKey: asientosQueryKey(funcion.id) });
            navigate("/reservas/alergenos", { state: { pelicula, funcion, selectedAsientos: selected } });
        } catch (e) {
            setAviso(
                axios.isAxiosError(e) && e.response?.data?.error
                    ? e.response.data.error
                    : "No se pudieron reservar los asientos. Inténtalo de nuevo."
            );
            
            const { data: fresco } = await refetch();
            if (fresco) {
                const mios = fresco.mi_bloqueo?.ids_asiento ?? [];
                setSelected((prev) =>
                    prev.filter((s) => {
                        const estado = fresco.asientos.find((a) => a.id === s.id)?.estado;
                        return estado === "disponible" || mios.includes(s.id);
                    })
                );
            }
        } finally {
            setIsBlocking(false);
        }
    };

    const renderMap = () => {
        if (isLoading) {
            return (
                <div className="py-16 flex flex-col items-center gap-3">
                    <Spinner size="md" />
                    <p className="text-[13px] text-[#86868b]">Cargando sala...</p>
                </div>
            );
        }
        if (isError) {
            return (
                <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-applePill bg-red-50 flex items-center justify-center text-red-500 mb-3">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-[#86868b] mb-4">No se pudieron cargar los asientos.</p>
                    <Button variant="primary" size="sm" onClick={() => refetch()}>
                        Reintentar
                    </Button>
                </div>
            );
        }
        if (filas.length === 0) {
            return (
                <p className="py-12 text-center text-[13px] text-[#86868b]">
                    Esta sala no tiene asientos configurados.
                </p>
            );
        }
        return (
            <SeatMap
                filas={filas}
                selectedIds={selected.map((s) => s.id)}
                occupiedIds={occupiedIds}
                pendingIds={pendingIds}
                onToggle={toggle}
            />
        );
    };

    const legend = [
        { label: "Disponible", cls: "bg-white border-[#d2d2d7]" },
        { label: "Seleccionado", cls: "bg-[#0071e3] border-[#0071e3]" },
        { label: "Pendiente", cls: "bg-amber-50 border-amber-400 border-dashed" },
        { label: "Ocupado", cls: "bg-[#e8e8ed] border-[#e8e8ed]" },
    ];

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Volver
            </button>

            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                    {pelicula.titulo}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#86868b]">
                    <span className="flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-[#0284c7]" />
                        {funcion.sala?.nombre || "Sala"}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
                        {funcion.fecha.split("T")[0]}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                        {funcion.horaInicio} - {funcion.horaFin}
                    </span>
                </div>
            </div>

            {aviso && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-[12px] rounded-appleLg px-4 py-2.5"
                >
                    <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {aviso}
                    </span>
                    <button type="button" onClick={() => setAviso(null)} className="font-semibold hover:underline">
                        Cerrar
                    </button>
                </div>
            )}

            <div className="bg-white border border-[#e5e5ea] rounded-appleLg shadow-xs p-5 sm:p-8 space-y-6">
                {renderMap()}
                <div className="flex flex-wrap justify-center gap-5 pt-4 border-t border-[#f0f0f0]">
                    {legend.map((l) => (
                        <div key={l.label} className="flex items-center gap-2 text-[12px] text-[#6e6e73]">
                            <span className={`w-4 h-4 rounded-t-md rounded-b-sm border ${l.cls}`} />
                            {l.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg p-4">
                <div className="text-[12px] text-[#1d1d1f]">
                    {selected.length === 0 ? (
                        <span className="text-[#86868b]">
                            Selecciona hasta {MAX_SEATS} asientos para continuar
                        </span>
                    ) : (
                        <>
                            <strong>
                                {[...selected]
                                    .sort((a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero)
                                    .map((s) => `${s.fila}${s.numero}`)
                                    .join(", ")}
                            </strong>
                            <span> · Total </span>
                            <strong className="text-[#0071e3]">{formatPrice(total)}</strong>
                        </>
                    )}
                </div>
                <Button 
                    variant="primary" 
                    size="sm" 
                    disabled={selected.length === 0 || isBlocking}
                    isLoading={isBlocking}
                    className="px-5"
                    onClick={handleContinuar}
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
}
