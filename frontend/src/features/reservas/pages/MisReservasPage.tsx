import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
    CalendarDays,
    Clock3,
    MapPin,
    Ticket,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    History,
    UtensilsCrossed,
    Armchair,
    CalendarCheck,
    CalendarX,
    Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import { useReservasActivas, useHistorialReservas, useDetalleReserva } from "../hooks/useHistorialReservas";
import { ReservaHistorial } from "../historial.types";
import { Spinner } from "../../../shared/components/Spinner";
import { Button } from "../../../shared/components/Button";

function formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);

    const formatted = new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(anio, mes - 1, dia));

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatearHora(hora: string): string {
    if (!hora) return "";
    let timeStr = hora;
    if (hora.includes("T")) {
        timeStr = hora.split("T")[1].slice(0, 5);
    } else {
        timeStr = hora.slice(0, 5);
    }
    const [hStr, mStr] = timeStr.split(":");
    const h = Number(hStr);
    const m = mStr || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
}

function formatearPrecio(monto: string | number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(Number(monto));
}

function ReservaDetalle({ id }: { id: number }) {
    const { data, isLoading, isError } = useDetalleReserva(id);

    if (isLoading) {
        return (
            <div className="flex justify-center py-6">
                <Spinner size="md" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <p className="text-sm text-red-600 py-4">
                No se pudo cargar el detalle de esta reserva.
            </p>
        );
    }

    return (
        <div className="mt-5 border-t border-[#e5e5ea] pt-5 space-y-6 animate-in fade-in duration-200">
            <div>
                <h3 className="font-semibold text-[#1d1d1f] mb-3 text-sm uppercase tracking-wider text-gray-500">
                    Desglose de comensales y butacas
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.asientos.map((item) => (
                        <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-[#e5e5ea] bg-[#fafafc] space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-[#1d1d1f]">
                                    Butaca {item.asiento.fila}{item.asiento.numero}
                                </span>
                                <span className="text-xs text-[#86868b]">
                                    Fila {item.asiento.fila}
                                </span>
                            </div>

                            {item.restricciones && item.restricciones.length > 0 ? (
                                <div className="space-y-1.5 pt-2 border-t border-[#f0f0f0]">
                                    <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                        Restricción culinaria:
                                    </span>
                                    {item.restricciones.map((r) => (
                                        <div key={r.id} className="text-xs text-[#6e6e73]">
                                            <span className="font-medium text-[#1d1d1f]">
                                                {r.restriccion.nombre}
                                            </span>
                                            {r.notas && <p className="text-[11px] text-[#86868b]">{r.notas}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-emerald-700 font-medium pt-1">
                                    Menú sensorial estándar (Sin restricciones)
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Menú Incluido */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <UtensilsCrossed className="w-4 h-4 text-[#0071e3]" />
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">
                        Menú gastronómico incluido en tu experiencia
                    </h4>
                </div>

                {data.funcion.pelicula.productos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.funcion.pelicula.productos.map((producto) => (
                            <div
                                key={producto.id}
                                className="flex gap-3 rounded-xl border border-[#e5e5ea] p-3 bg-white"
                            >
                                {producto.imagenUrl ? (
                                    <img
                                        src={producto.imagenUrl}
                                        alt={producto.nombre}
                                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-[#f5f5f7] flex items-center justify-center shrink-0">
                                        <UtensilsCrossed className="w-5 h-5 text-[#86868b]" />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    {producto.categoria && (
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] mb-0.5">
                                            {producto.categoria}
                                        </p>
                                    )}

                                    <p className="text-sm font-semibold text-[#1d1d1f] truncate">
                                        {producto.nombre}
                                    </p>

                                    {producto.descripcion && (
                                        <p className="mt-1 text-xs text-[#86868b] line-clamp-2">
                                            {producto.descripcion}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[#86868b]">
                        No hay productos registrados para el menú de esta película.
                    </p>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e5e5ea] flex justify-between items-center text-sm">
                <span className="text-[#6e6e73]">Total pagado de la reserva</span>
                <span className="text-base font-bold text-[#1d1d1f]">
                    {formatearPrecio(data.montoTotal)}
                </span>
            </div>
        </div>
    );
}

function ReservaCard({
    reserva,
    seleccionada,
    onToggle,
    esProxima = false,
    tipo = "activa",
}: {
    reserva: ReservaHistorial;
    seleccionada: boolean;
    onToggle: () => void;
    esProxima?: boolean;
    tipo?: "activa" | "historial";
}) {
    const pelicula = reserva.funcion.pelicula;
    const funcion = reserva.funcion;
    const asientos = reserva.asientos || [];

    const esConfirmada = reserva.estado.toLowerCase() === "confirmado";

    return (
        <article className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
            esProxima 
                ? "border-[#0071e3]/40 ring-1 ring-[#0071e3]/20 bg-gradient-to-br from-white via-white to-blue-50/20" 
                : "border-[#e5e5ea]"
        }`}>
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Póster de la Película */}
                <div className="w-full sm:w-32 shrink-0">
                    {pelicula.posterUrl ? (
                        <img
                            src={pelicula.posterUrl}
                            alt={`Póster de ${pelicula.titulo}`}
                            className="w-full sm:w-32 h-52 sm:h-44 object-cover rounded-xl shadow-xs"
                        />
                    ) : (
                        <div className="w-full sm:w-32 h-52 sm:h-44 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                            <Ticket className="w-8 h-8 text-[#86868b]" />
                        </div>
                    )}
                </div>

                {/* Contenido Principal de la Reserva */}
                <div className="flex-1 min-w-0">
                    {/* Encabezado: Badges y Estado */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {esProxima && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    Tu próxima función
                                </span>
                            )}

                            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
                                {tipo === "activa" ? "Reserva Activa" : "Función Anterior"}
                            </span>
                        </div>

                        {/* Estado de la reserva */}
                        <div>
                            {esConfirmada ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Confirmada
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                    {reserva.estado}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Título de la Película */}
                    <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                        {pelicula.titulo}
                    </h2>

                    {/* Información de la Función: Fecha, Hora y Sala */}
                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-sm text-[#6e6e73]">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#0071e3] shrink-0" />
                            <span className="font-medium text-[#1d1d1f]">
                                {formatearFecha(funcion.fecha)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock3 className="w-4 h-4 text-[#0071e3] shrink-0" />
                            <span>
                                {formatearHora(funcion.horaInicio)} - {formatearHora(funcion.horaFin)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#0071e3] shrink-0" />
                            <span className="truncate">{funcion.sala.nombre}</span>
                        </div>
                    </div>

                    {/* Sillas Seleccionadas */}
                    <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] mr-1">
                            <Armchair className="w-4 h-4 text-[#0071e3]" />
                            <span>Sillas seleccionadas:</span>
                        </div>

                        {asientos.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {asientos.map((item) => (
                                    <span
                                        key={item.id}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#f5f5f7] border border-[#e5e5ea] text-xs font-bold text-[#1d1d1f]"
                                    >
                                        {item.asiento.fila}{item.asiento.numero}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs text-[#86868b]">Sin sillas asignadas</span>
                        )}
                    </div>

                    {/* Botón de detalle expandible */}
                    <div className="mt-4 flex items-center justify-between pt-1">
                        <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={onToggle}
                            className="text-xs"
                        >
                            {seleccionada ? "Ocultar menú y comensales" : "Ver menú y detalles"}
                            {seleccionada ? (
                                <ChevronUp className="w-3.5 h-3.5 ml-1.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                            )}
                        </Button>

                        <span className="text-xs font-medium text-[#86868b]">
                            Total: <strong className="text-[#1d1d1f] text-sm">{formatearPrecio(reserva.montoTotal)}</strong>
                        </span>
                    </div>

                    {seleccionada && <ReservaDetalle id={reserva.id} />}
                </div>
            </div>
        </article>
    );
}

export function MisReservasPage() {
    const { isAuthenticated } = useAuthStore();
    const [tab, setTab] = useState<"activas" | "historial">("activas");
    const [reservaSeleccionada, setReservaSeleccionada] = useState<number | null>(null);

    const {
        data: reservasActivas,
        isLoading: isLoadingActivas,
        isError: isErrorActivas,
        refetch: refetchActivas,
    } = useReservasActivas();

    const {
        data: reservasHistorial,
        isLoading: isLoadingHistorial,
        isError: isErrorHistorial,
        refetch: refetchHistorial,
    } = useHistorialReservas();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isLoading = tab === "activas" ? isLoadingActivas : isLoadingHistorial;
    const isError = tab === "activas" ? isErrorActivas : isErrorHistorial;
    const refetch = tab === "activas" ? refetchActivas : refetchHistorial;

    return (
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Encabezado */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                    <CalendarCheck className="w-5 h-5 text-[#0071e3]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
                        Tus experiencias reservadas
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
                    Mis reservas
                </h1>

                <p className="mt-2 text-sm sm:text-base text-[#86868b] max-w-2xl">
                    Visualiza tus próximas funciones activas de cine con menú gastronómico o consulta el historial de funciones a las que has asistido.
                </p>

                {/* Selector de Pestañas Apple-style */}
                <div className="flex border-b border-[#e5e5ea] gap-8 mt-8">
                    <button
                        type="button"
                        onClick={() => {
                            setTab("activas");
                            setReservaSeleccionada(null);
                        }}
                        className={`pb-3.5 text-sm sm:text-base font-semibold flex items-center gap-2.5 border-b-2 transition-colors ${
                            tab === "activas"
                                ? "border-[#0071e3] text-[#0071e3]"
                                : "border-transparent text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                    >
                        <CalendarCheck className="w-4 h-4" />
                        <span>Próximas funciones</span>
                        {reservasActivas && (
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    tab === "activas"
                                        ? "bg-[#0071e3] text-white"
                                        : "bg-[#f5f5f7] text-[#6e6e73]"
                                }`}
                            >
                                {reservasActivas.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setTab("historial");
                            setReservaSeleccionada(null);
                        }}
                        className={`pb-3.5 text-sm sm:text-base font-semibold flex items-center gap-2.5 border-b-2 transition-colors ${
                            tab === "historial"
                                ? "border-[#0071e3] text-[#0071e3]"
                                : "border-transparent text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                    >
                        <History className="w-4 h-4" />
                        <span>Historial anterior</span>
                        {reservasHistorial && (
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    tab === "historial"
                                        ? "bg-[#0071e3] text-white"
                                        : "bg-[#f5f5f7] text-[#6e6e73]"
                                }`}
                            >
                                {reservasHistorial.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Estado de Carga */}
            {isLoading && (
                <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                    <Spinner size="md" />
                    <p className="text-sm text-[#86868b]">
                        {tab === "activas"
                            ? "Cargando tus reservas activas..."
                            : "Cargando tu historial de reservas..."}
                    </p>
                </div>
            )}

            {/* Estado de Error */}
            {!isLoading && isError && (
                <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <h2 className="text-xl font-bold text-[#1d1d1f]">
                        No pudimos cargar tus reservas
                    </h2>
                    <p className="mt-2 mb-5 text-sm text-[#86868b]">
                        Comprueba tu conexión e inténtalo nuevamente.
                    </p>
                    <Button variant="primary" size="sm" onClick={() => refetch()}>
                        Intentar de nuevo
                    </Button>
                </div>
            )}

            {/* PESTAÑA 1: RESERVAS ACTIVAS (PRÓXIMAS FUNCIONES) */}
            {!isLoading && !isError && tab === "activas" && (
                <div>
                    {!reservasActivas || reservasActivas.length === 0 ? (
                        /* Criterio 4: Si el usuario no tiene reservas activas, debe visualizar un mensaje que le informe que no tiene próximas funciones reservadas. */
                        <div className="rounded-2xl border border-[#e5e5ea] bg-white px-6 py-14 text-center shadow-xs">
                            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
                                <CalendarX className="w-8 h-8 text-[#86868b]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#1d1d1f]">
                                No tienes próximas funciones reservadas
                            </h2>
                            <p className="mt-2 text-sm text-[#86868b] max-w-md mx-auto">
                                Cuando reserves boletos para próximas funciones, aparecerán aquí con todos los detalles de la película, sala, horario y butacas.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-[#0071e3] text-white text-sm font-semibold hover:bg-[#0077ed] transition-colors shadow-xs"
                            >
                                <Ticket className="w-4 h-4" />
                                Explorar cartelera
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reservasActivas.map((reserva, index) => (
                                <ReservaCard
                                    key={reserva.id}
                                    reserva={reserva}
                                    esProxima={index === 0}
                                    tipo="activa"
                                    seleccionada={reservaSeleccionada === reserva.id}
                                    onToggle={() =>
                                        setReservaSeleccionada((actual) =>
                                            actual === reserva.id ? null : reserva.id
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PESTAÑA 2: HISTORIAL DE RESERVAS ANTERIORES */}
            {!isLoading && !isError && tab === "historial" && (
                <div>
                    {!reservasHistorial || reservasHistorial.length === 0 ? (
                        <div className="rounded-2xl border border-[#e5e5ea] bg-white px-6 py-14 text-center shadow-xs">
                            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
                                <History className="w-8 h-8 text-[#86868b]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#1d1d1f]">
                                Aún no tienes reservas anteriores
                            </h2>
                            <p className="mt-2 text-sm text-[#86868b] max-w-md mx-auto">
                                Las reservas de funciones que ya hayan terminado se registrarán en esta sección.
                            </p>
                            <Link
                                to="/"
                                className="inline-block mt-5 text-sm font-semibold text-[#0071e3] hover:underline"
                            >
                                Explorar cartelera
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reservasHistorial.map((reserva) => (
                                <ReservaCard
                                    key={reserva.id}
                                    reserva={reserva}
                                    tipo="historial"
                                    seleccionada={reservaSeleccionada === reserva.id}
                                    onToggle={() =>
                                        setReservaSeleccionada((actual) =>
                                            actual === reserva.id ? null : reserva.id
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
