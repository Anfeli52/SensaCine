import { useState } from "react";
import { CalendarDays, Clock3, MapPin, Ticket, ChevronDown, ChevronUp, AlertCircle, History, UtensilsCrossed } from "lucide-react";
import { useHistorialReservas, useDetalleReserva } from "../hooks/useHistorialReservas";
import { ReservaHistorial } from "../historial.types";
import { Spinner } from "../../../shared/components/Spinner";
import { Button } from "../../../shared/components/Button";

function formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);

    return new Intl.DateTimeFormat("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(anio, mes - 1, dia));
}

function formatearHora(hora: string): string {
    const fecha = new Date(hora);

    return fecha.toISOString().slice(11, 16);
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
        <div className="mt-5 border-t border-[#e5e5ea] pt-4">
            <h3 className="font-semibold text-[#1d1d1f] mb-3">
                Detalle de la reserva
            </h3>

            <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-4 h-4 text-[#0071e3]" />
                <span className="text-sm font-medium text-[#1d1d1f]">
                    Asientos reservados
                </span>
            </div>

            {data.asientos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {data.asientos.map((item) => (
                        <span
                            key={item.id}
                            className="px-3 py-1.5 rounded-lg bg-[#f5f5f7] text-sm font-medium text-[#1d1d1f]"
                        >
                            {item.asiento.fila}{item.asiento.numero}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[#86868b]">
                    Esta reserva no tiene asientos registrados.
                </p>
            )}


            <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                    <UtensilsCrossed className="w-4 h-4 text-[#0071e3]" />
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">
                        Menú incluido en tu experiencia
                    </h4>
                </div>

                {data.funcion.pelicula.productos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.funcion.pelicula.productos.map((producto) => (
                            <div
                                key={producto.id}
                                className="flex gap-3 rounded-xl border border-[#e5e5ea] p-3"
                            >
                                {producto.imagenUrl ? (
                                    <img
                                        src={producto.imagenUrl}
                                        alt={producto.nombre}
                                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg bg-[#f5f5f7] flex items-center justify-center shrink-0">
                                        <UtensilsCrossed className="w-6 h-6 text-[#86868b]" />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    {producto.categoria && (
                                        <p className="text-xs font-medium text-[#0071e3] mb-1">
                                            {producto.categoria}
                                        </p>
                                    )}

                                    <p className="text-sm font-semibold text-[#1d1d1f]">
                                        {producto.nombre}
                                    </p>

                                    {producto.descripcion && (
                                        <p className="mt-1 text-xs text-[#86868b]">
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

            <div className="mt-4 flex justify-between items-center gap-3">
                <span className="text-sm text-[#6e6e73]">Total de la reserva</span>
                <span className="font-semibold text-[#1d1d1f]">
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
}: {
    reserva: ReservaHistorial;
    seleccionada: boolean;
    onToggle: () => void;
}) {
    const pelicula = reserva.funcion.pelicula;
    const funcion = reserva.funcion;

    return (
        <article className="bg-white border border-[#e5e5ea] rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-32 shrink-0">
                    {pelicula.posterUrl ? (
                        <img
                            src={pelicula.posterUrl}
                            alt={`Póster de ${pelicula.titulo}`}
                            className="w-full sm:w-32 h-48 sm:h-44 object-cover rounded-xl"
                        />
                    ) : (
                        <div className="w-full sm:w-32 h-48 sm:h-44 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                            <Ticket className="w-8 h-8 text-[#86868b]" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#0071e3]">
                            Reserva
                        </span>

                        <span className="text-xs rounded-full px-2.5 py-1 bg-[#f5f5f7] text-[#6e6e73]">
                            {reserva.estado}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                        {pelicula.titulo}
                    </h2>

                    <div className="mt-4 space-y-3 text-sm text-[#6e6e73]">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#0071e3] shrink-0" />
                            <span>{formatearFecha(funcion.fecha)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock3 className="w-4 h-4 text-[#0071e3] shrink-0" />
                            <span>
                                {formatearHora(funcion.horaInicio)} -{" "}
                                {formatearHora(funcion.horaFin)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#0071e3] shrink-0" />
                            <span>{funcion.sala.nombre}</span>
                        </div>
                    </div>

                    <div className="mt-5">
                        <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={onToggle}
                        >
                            {seleccionada ? "Ocultar detalle" : "Ver detalle"}
                            {seleccionada ? (
                                <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                                <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                        </Button>
                    </div>

                    {seleccionada && <ReservaDetalle id={reserva.id} />}
                </div>
            </div>
        </article>
    );
}

export function MisReservasPage() {
    const [reservaSeleccionada, setReservaSeleccionada] = useState<number | null>(null);

    const { data: reservas, isLoading, isError, refetch } = useHistorialReservas();

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Spinner size="md" />
                <p className="text-sm text-[#86868b]">Cargando tu historial...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <h1 className="text-xl font-bold text-[#1d1d1f]">
                    No pudimos cargar tus reservas
                </h1>
                <p className="mt-2 mb-5 text-sm text-[#86868b]">
                    Comprueba tu conexión e inténtalo nuevamente.
                </p>
                <Button variant="primary" size="sm" onClick={() => refetch()}>
                    Intentar de nuevo
                </Button>
            </div>
        );
    }

    return (
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <History className="w-5 h-5 text-[#0071e3]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
                        Tu experiencia en SensaCine
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
                    Mis reservas pasadas
                </h1>

                <p className="mt-3 text-sm sm:text-base text-[#86868b] max-w-2xl">
                    Consulta las películas que has disfrutado, los horarios y los asientos
                    asociados a cada reserva.
                </p>
            </div>

            {!reservas || reservas.length === 0 ? (
                <div className="rounded-2xl border border-[#e5e5ea] bg-white px-6 py-12 text-center">
                    <Ticket className="w-10 h-10 text-[#86868b] mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-[#1d1d1f]">
                        Aún no tienes reservas anteriores
                    </h2>
                    <p className="mt-2 text-sm text-[#86868b]">
                        Cuando tengas reservas de funciones que ya hayan terminado,
                        aparecerán aquí.
                    </p>
                    <a
                        href="/"
                        className="inline-block mt-5 text-sm font-semibold text-[#0071e3] hover:underline"
                    >
                        Explorar cartelera
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {reservas.map((reserva) => (
                        <ReservaCard
                            key={reserva.id}
                            reserva={reserva}
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
        </main>
    );
}
