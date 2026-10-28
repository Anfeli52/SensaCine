import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    CalendarDays,
    Clock3,
    MapPin,
    UtensilsCrossed,
    CheckCircle2,
    ChefHat,
    Clock,
    Layers,
    ListFilter,
} from "lucide-react";
import { useDetalleFuncionCocina } from "../hooks/useDetalleFuncionCocina";
import { OrdenCocinaItem } from "../components/OrdenCocinaItem";
import type { AsistenteCocina, EstadoOrden } from "../types";
import { obtenerEstadoOrden } from "../types";

function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString("es-CO", {
        timeZone: "UTC",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatearHora(hora: string): string {
    return hora.slice(11, 16);
}

export function DetalleFuncionCocinaPage() {
    const { id } = useParams();
    const funcionId = Number(id);

    const { data: funcion, isLoading, isError, refetch } = useDetalleFuncionCocina(funcionId);

    const [filtroEstado, setFiltroEstado] = useState<"todas" | EstadoOrden>("todas");
    const [vistaModo, setVistaModo] = useState<"ordenes" | "reservas">("ordenes");

    const todasLasOrdenes = useMemo(() => {
        if (!funcion) return [];
        const lista: Array<{
            asistente: AsistenteCocina;
            idReserva: number;
            titularReserva: string;
        }> = [];

        for (const reserva of funcion.reservas) {
            for (const asiento of reserva.asientos) {
                lista.push({
                    asistente: asiento,
                    idReserva: reserva.id,
                    titularReserva: reserva.usuario.nombre,
                });
            }
        }
        return lista;
    }, [funcion]);

    const totalOrdenes = todasLasOrdenes.length;
    const ordenesPendientes = useMemo(
        () => todasLasOrdenes.filter((o) => obtenerEstadoOrden(o.asistente) === "Pendiente").length,
        [todasLasOrdenes],
    );
    const ordenesEnPreparacion = useMemo(
        () =>
            todasLasOrdenes.filter((o) => obtenerEstadoOrden(o.asistente) === "En_preparacion").length,
        [todasLasOrdenes],
    );
    const ordenesListas = useMemo(
        () => todasLasOrdenes.filter((o) => obtenerEstadoOrden(o.asistente) === "Lista").length,
        [todasLasOrdenes],
    );

    const ordenesFiltradas = useMemo(() => {
        if (filtroEstado === "todas") return todasLasOrdenes;
        return todasLasOrdenes.filter(
            (o) => obtenerEstadoOrden(o.asistente) === filtroEstado,
        );
    }, [todasLasOrdenes, filtroEstado]);

    const porcentajeCompletado = totalOrdenes > 0 ? Math.round((ordenesListas / totalOrdenes) * 100) : 0;

    if (!id || !Number.isInteger(funcionId) || funcionId <= 0) {
        return (
            <main className="mx-auto w-[92%] max-w-6xl py-12 text-gray-900">
                <p className="text-red-600">El identificador de la función no es válido.</p>
                <Link to="/cocina" className="mt-4 inline-block text-blue-600 hover:underline">
                    ← Volver a las funciones
                </Link>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="mx-auto w-[92%] max-w-6xl py-12 text-gray-900">
                <p className="text-sm text-gray-600">Cargando detalle de la función y órdenes...</p>
            </main>
        );
    }

    if (isError || !funcion) {
        return (
            <main className="mx-auto w-[92%] max-w-6xl py-12 text-gray-900">
                <p className="text-red-600">No fue posible consultar el detalle de esta función.</p>
                <div className="mt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-lg bg-[#0071e3] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Intentar de nuevo
                    </button>
                    <Link
                        to="/cocina"
                        className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Volver a las funciones
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto w-[92%] max-w-6xl py-8 text-gray-900 sm:py-12">
            <Link
                to="/cocina"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0071e3] transition hover:text-blue-800"
            >
                <span aria-hidden="true">←</span>
                Volver a la agenda de cocina
            </Link>

            <header className="mb-8 mt-5 border-b border-gray-200 pb-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">
                    SENSACINE · COCINA & PREPARACIÓN
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {funcion.pelicula.titulo}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
                        <MapPin className="h-4 w-4 text-[#0071e3]" />
                        {funcion.sala.nombre}
                    </span>
                    <span className="inline-flex items-center gap-1.5 capitalize">
                        <CalendarDays className="h-4 w-4 text-[#0071e3]" />
                        {formatearFecha(funcion.fecha)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-[#0071e3]" />
                        Inicio: {formatearHora(funcion.horaInicio)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <UtensilsCrossed className="h-4 w-4 text-[#0071e3]" />
                        {funcion.pelicula.productos.length} productos en menú
                    </span>
                </div>

                {/* Barra de progreso de preparación */}
                {totalOrdenes > 0 && (
                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-800">
                                Avance de preparación antes de la función
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {ordenesListas} de {totalOrdenes} órdenes listas ({porcentajeCompletado}%)
                            </span>
                        </div>
                        <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${porcentajeCompletado}%` }}
                            />
                        </div>
                    </div>
                )}
            </header>

            {/* Tarjetas resumen de estado de órdenes */}
            <section className="mb-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total órdenes
                        </p>
                        <p className="mt-1.5 text-2xl font-bold text-gray-900 sm:text-3xl">
                            {totalOrdenes}
                        </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                                Pendientes
                            </p>
                            <Clock className="h-4 w-4 text-amber-700" />
                        </div>
                        <p className="mt-1.5 text-2xl font-bold text-amber-900 sm:text-3xl">
                            {ordenesPendientes}
                        </p>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                                En preparación
                            </p>
                            <ChefHat className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="mt-1.5 text-2xl font-bold text-blue-900 sm:text-3xl">
                            {ordenesEnPreparacion}
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                                Listas
                            </p>
                            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        </div>
                        <p className="mt-1.5 text-2xl font-bold text-emerald-900 sm:text-3xl">
                            {ordenesListas}
                        </p>
                    </div>
                </div>
            </section>

            {/* Menú de la experiencia */}
            <section className="mb-10">
                <details className="group rounded-xl border border-gray-200 bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0071e3]">
                                <UtensilsCrossed className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                                    Menú de la experiencia ({funcion.pelicula.productos.length} productos)
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Productos gastronómicos que se servirán en esta película
                                </p>
                            </div>
                        </div>
                        <span className="text-gray-400 transition-transform group-open:rotate-180">
                            ▼
                        </span>
                    </summary>

                    <div className="border-t border-gray-100 p-4 sm:p-5">
                        {funcion.pelicula.productos.length === 0 ? (
                            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                                Esta película no tiene productos activos en su menú.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {funcion.pelicula.productos.map((producto) => (
                                    <article
                                        key={producto.id}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        {producto.imagenUrl && (
                                            <img
                                                src={producto.imagenUrl}
                                                alt={producto.nombre}
                                                loading="lazy"
                                                className="h-36 w-full object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                                {producto.categoria ?? "Producto"}
                                            </p>
                                            <h3 className="mt-1 font-semibold text-gray-900">
                                                {producto.nombre}
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                                {producto.descripcion || "Sin descripción."}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </details>
            </section>

            {/* Sección de Órdenes y Preparación */}
            <section>
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Órdenes de cocina
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Consulta y actualiza el estado de cada orden para organizar el trabajo
                        </p>
                    </div>

                    {/* Selector de modo de vista */}
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => setVistaModo("ordenes")}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                vistaModo === "ordenes"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <ListFilter className="h-3.5 w-3.5" />
                            Vista individual ({totalOrdenes})
                        </button>
                        <button
                            type="button"
                            onClick={() => setVistaModo("reservas")}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                vistaModo === "reservas"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <Layers className="h-3.5 w-3.5" />
                            Agrupado por reserva ({funcion.reservas.length})
                        </button>
                    </div>
                </div>

                {/* Filtros por estado */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Filtrar por estado:</span>
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("todas")}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filtroEstado === "todas"
                                ? "bg-gray-900 text-white"
                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Todas ({totalOrdenes})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("Pendiente")}
                        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filtroEstado === "Pendiente"
                                ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-300"
                                : "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        }`}
                    >
                        <Clock className="h-3 w-3" />
                        Pendientes ({ordenesPendientes})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("En_preparacion")}
                        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filtroEstado === "En_preparacion"
                                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                                : "border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                        }`}
                    >
                        <ChefHat className="h-3 w-3" />
                        En preparación ({ordenesEnPreparacion})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroEstado("Lista")}
                        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filtroEstado === "Lista"
                                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        }`}
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Listas ({ordenesListas})
                    </button>
                </div>

                {/* Contenido según el modo de vista */}
                {totalOrdenes === 0 ? (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                        <UtensilsCrossed className="mx-auto h-8 w-8 text-gray-400" />
                        <h3 className="mt-3 font-semibold text-gray-900">Todavía no hay órdenes registradas</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Cuando existan reservas para esta función, sus órdenes aparecerán aquí para preparación.
                        </p>
                    </div>
                ) : ordenesFiltradas.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                        <p className="text-sm text-gray-600">
                            No hay órdenes en estado <span className="font-semibold">{filtroEstado === "En_preparacion" ? "En preparación" : filtroEstado}</span>.
                        </p>
                        <button
                            type="button"
                            onClick={() => setFiltroEstado("todas")}
                            className="mt-3 text-xs font-semibold text-[#0071e3] hover:underline"
                        >
                            Ver todas las órdenes
                        </button>
                    </div>
                ) : vistaModo === "ordenes" ? (
                    /* Vista individual de órdenes */
                    <div className="mt-6 space-y-4">
                        {ordenesFiltradas.map(({ asistente, idReserva, titularReserva }) => (
                            <OrdenCocinaItem
                                key={asistente.id}
                                asistente={asistente}
                                idReserva={idReserva}
                                titularReserva={titularReserva}
                                funcionId={funcionId}
                            />
                        ))}
                    </div>
                ) : (
                    /* Vista agrupada por reserva */
                    <div className="mt-6 space-y-5">
                        {funcion.reservas
                            .map((reserva) => {
                                const asientosFiltrados =
                                    filtroEstado === "todas"
                                        ? reserva.asientos
                                        : reserva.asientos.filter(
                                              (a) => obtenerEstadoOrden(a) === filtroEstado,
                                          );

                                return { reserva, asientosFiltrados };
                            })
                            .filter(({ asientosFiltrados }) => asientosFiltrados.length > 0)
                            .map(({ reserva, asientosFiltrados }) => (
                                <details
                                    key={reserva.id}
                                    open
                                    className="group rounded-xl border border-gray-200 bg-white shadow-sm"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-gray-100 p-4 sm:p-5">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Reserva #{reserva.id} · Titular: {reserva.usuario.nombre}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {asientosFiltrados.length}{" "}
                                                {asientosFiltrados.length === 1
                                                    ? "orden visible"
                                                    : "órdenes visibles"}{" "}
                                                (Total reserva: {reserva.asientos.length}) · {reserva.usuario.email}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    reserva.estado.toLowerCase() === "confirmado"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {reserva.estado}
                                            </span>
                                            <span className="text-gray-400 transition-transform group-open:rotate-180">
                                                ▼
                                            </span>
                                        </div>
                                    </summary>

                                    <div className="space-y-4 p-4 sm:p-5">
                                        {asientosFiltrados.map((asistente) => (
                                            <OrdenCocinaItem
                                                key={asistente.id}
                                                asistente={asistente}
                                                idReserva={reserva.id}
                                                titularReserva={reserva.usuario.nombre}
                                                funcionId={funcionId}
                                            />
                                        ))}
                                    </div>
                                </details>
                            ))}
                    </div>
                )}
            </section>
        </main>
    );
}
