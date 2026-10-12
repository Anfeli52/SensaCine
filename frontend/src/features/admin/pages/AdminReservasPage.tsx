import { useState } from "react";
import { useAdminReservas } from "../hooks/useAdminReservas";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { ListCheck } from "lucide-react";
import type { Reserva } from "../types/reservas.types";

function formatearFecha(fecha: string): string {
    const fechaLimpia = fecha.split("T")[0];
    const [anio, mes, dia] = fechaLimpia.split("-").map(Number);

    const fechaLocal = new Date(anio, mes - 1, dia);

    return fechaLocal.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatearHora(hora: string): string {
    const horaLimpia = hora.includes("T")
        ? hora.split("T")[1]
        : hora;

    const [horas, minutos] = horaLimpia.split(":").map(Number);
    const fecha = new Date(2000, 0, 1, horas, minutos);

    return fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function obtenerAsientos(reserva: Reserva): string {
    if (reserva.asientos.length === 0) {
        return "Sin asientos";
    }

    return reserva.asientos
        .map(({ asiento }) => `${asiento.fila}${asiento.numero}`)
        .join(", ");
}

function EstadoReserva({ estado }: { estado: string }) {
    const estadoNormalizado = estado.toLowerCase();

    const clasesEstado =
        estadoNormalizado === "confirmado"
            ? "bg-green-100 text-green-700"
            : estadoNormalizado === "cancelado"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600";

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${clasesEstado}`}>
            {estado}
        </span>
    );
}

export function AdminReservasPage() {
    const { data: reservas, isLoading, isError, refetch, isFetching } = useAdminReservas();
    const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);

    const [fechaFiltro, setFechaFiltro] = useState("");
    const [peliculaFiltro, setPeliculaFiltro] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");

    const reservasFiltradas = (reservas ?? []).filter((reserva) => {
        const fechaFuncion = reserva.funcion.fecha.split("T")[0];

        const coincideFecha =
            !fechaFiltro || fechaFuncion === fechaFiltro;

        const coincidePelicula =
            !peliculaFiltro ||
            String(reserva.funcion.pelicula.id) === peliculaFiltro;

        const coincideEstado =
            !estadoFiltro ||
            reserva.estado.toLowerCase() === estadoFiltro.toLowerCase();

        return coincideFecha && coincidePelicula && coincideEstado;
    });

    const peliculasDisponibles = Array.from(
        new Map(
            (reservas ?? []).map((reserva) => [
                reserva.funcion.pelicula.id,
                reserva.funcion.pelicula.titulo,
            ])
        ),
        ([id, titulo]) => ({ id, titulo })
    );

    function filtrarReservasDeHoy() {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        setFechaFiltro(`${anio}-${mes}-${dia}`);
    }

    return (
        <main className="min-h-screen px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <AdminNavTabs />
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-[#0071e3] uppercase mb-1">
                            <ListCheck className="w-4 h-4" />
                            <span>Panel de Administración</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                            Gestión de Reservas
                        </h1>

                        <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
                            Consulta y organiza las reservas de los usuarios y sus funciones.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        className="self-start md:self-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isFetching ? "Actualizando..." : "Actualizar reservas"}
                    </button>
                </div>

                <div className="mb-6 rounded-2xl border border-gray-1000 bg-white p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-[#1d1d1f]">
                                Filtrar reservas
                            </h2>
                            <p className="mt-1 text-sm text-[#86868b]">
                                Encuentra las reservas según la función y su estado.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={filtrarReservasDeHoy}
                            className="rounded-xl bg-[#0071e3]/10 px-4 py-2 text-sm font-semibold text-[#0071e3] hover:bg-[#0071e3]/15"
                        >
                            Ver reservas de hoy
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <label className="text-sm font-medium text-[#424245]">
                            Fecha de la función
                            <input
                                type="date"
                                value={fechaFiltro}
                                onChange={(event) => setFechaFiltro(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal"
                            />
                        </label>

                        <label className="text-sm font-medium text-[#424245]">
                            Película
                            <select
                                value={peliculaFiltro}
                                onChange={(event) => setPeliculaFiltro(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal"
                            >
                                <option value="">Todas las películas</option>
                                {peliculasDisponibles.map((pelicula) => (
                                    <option key={pelicula.id} value={String(pelicula.id)}>
                                        {pelicula.titulo}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm font-medium text-[#424245]">
                            Estado
                            <select
                                value={estadoFiltro}
                                onChange={(event) => setEstadoFiltro(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal"
                            >
                                <option value="">Todos los estados</option>
                                <option value="Confirmado">Confirmado</option>
                                <option value="Cancelado">Cancelado</option>
                                <option value="Finalizado">Finalizado</option>
                            </select>
                        </label>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <p className="text-sm text-[#86868b]">
                            Resultados:{" "}
                            <span className="font-semibold text-[#1d1d1f]">
                                {reservasFiltradas.length}
                            </span>
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setFechaFiltro("");
                                setPeliculaFiltro("");
                                setEstadoFiltro("");
                            }}
                            className="text-sm font-semibold text-[#0071e3] hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <p className="text-sm text-[#86868b]">
                            Cargando reservas...
                        </p>
                    </div>
                ) : isError ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <h2 className="font-semibold text-[#1d1d1f]">
                            No se pudieron cargar las reservas
                        </h2>
                        <p className="mt-2 text-sm text-[#86868b]">
                            Verifica tu conexión e inténtalo nuevamente.
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-4 rounded-xl bg-[#0071e3] px-5 py-2 text-sm font-semibold text-white"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : !reservas || reservasFiltradas.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
                        <h2 className="text-lg font-semibold text-[#1d1d1f]">
                            {reservas && reservas.length > 0
                                ? "No hay reservas que coincidan con los filtros"
                                : "No hay reservas disponibles"}
                        </h2>
                        <p className="mt-2 text-sm text-[#86868b]">
                            Cuando existan reservas registradas, aparecerán en esta sección.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-5 rounded-2xl border border-gray-1000 bg-white p-5">
                            <p className="text-sm text-[#86868b]">Total de reservas registradas</p>
                            <p className="mt-1 text-3xl font-bold text-[#1d1d1f]">
                                {reservas.length}
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-white border border-gray-1000 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1050px] text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50">
                                        <tr className="text-xs uppercase tracking-wide text-[#86868b]">
                                            <th className="px-5 py-4 font-semibold">Reserva</th>
                                            <th className="px-5 py-4 font-semibold">Cliente</th>
                                            <th className="px-5 py-4 font-semibold">Película</th>
                                            <th className="px-5 py-4 font-semibold">Función</th>
                                            <th className="px-5 py-4 font-semibold">Sala</th>
                                            <th className="px-5 py-4 font-semibold">Asientos</th>
                                            <th className="px-5 py-4 font-semibold">Estado</th>
                                            <th className="px-5 py-4 font-semibold">Detalle</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {reservasFiltradas.map((reserva) => (
                                            <tr
                                                key={reserva.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4 font-semibold text-[#1d1d1f]">
                                                    #{reserva.id}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-[#1d1d1f]">
                                                        {reserva.usuario.nombre}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#86868b]">
                                                        {reserva.usuario.email}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 font-medium text-[#1d1d1f]">
                                                    {reserva.funcion.pelicula.titulo}
                                                </td>
                                                <td className="px-5 py-4 text-[#424245]">
                                                    <p>{formatearFecha(reserva.funcion.fecha)}</p>
                                                    <p className="mt-1 text-xs text-[#86868b]">
                                                        {formatearHora(reserva.funcion.horaInicio)}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-[#424245]">
                                                    {reserva.funcion.sala.nombre}
                                                </td>
                                                <td className="px-5 py-4 text-[#424245]">
                                                    {obtenerAsientos(reserva)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <EstadoReserva estado={reserva.estado} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReservaSeleccionada(reserva)}
                                                        className="font-semibold text-[#0071e3] hover:underline"
                                                    >
                                                        Ver detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {reservaSeleccionada && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setReservaSeleccionada(null)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="detalle-reserva-titulo"
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-[#86868b]">
                                    Reserva #{reservaSeleccionada.id}
                                </p>
                                <h2
                                    id="detalle-reserva-titulo"
                                    className="mt-1 text-2xl font-bold text-[#1d1d1f]"
                                >
                                    Detalle de la reserva
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReservaSeleccionada(null)}
                                aria-label="Cerrar detalle"
                                className="rounded-full px-3 py-1 text-xl text-[#86868b] hover:bg-gray-100"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-6 space-y-4 text-sm">
                            <div>
                                <p className="text-[#86868b]">Cliente</p>
                                <p className="mt-1 font-medium text-[#1d1d1f]">
                                    {reservaSeleccionada.usuario.nombre}
                                </p>
                                <p className="text-[#424245]">
                                    {reservaSeleccionada.usuario.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#86868b]">Película</p>
                                <p className="mt-1 font-medium text-[#1d1d1f]">
                                    {reservaSeleccionada.funcion.pelicula.titulo}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#86868b]">Fecha y hora</p>
                                <p className="mt-1 font-medium text-[#1d1d1f]">
                                    {formatearFecha(reservaSeleccionada.funcion.fecha)} ·{" "}
                                    {formatearHora(reservaSeleccionada.funcion.horaInicio)} -{" "}
                                    {formatearHora(reservaSeleccionada.funcion.horaFin)}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#86868b]">Sala</p>
                                <p className="mt-1 font-medium text-[#1d1d1f]">
                                    {reservaSeleccionada.funcion.sala.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#86868b]">Asientos reservados</p>
                                <p className="mt-1 font-medium text-[#1d1d1f]">
                                    {obtenerAsientos(reservaSeleccionada)}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#86868b]">Monto total</p>
                                <p className="mt-1 font-semibold text-[#1d1d1f]">
                                    {Number(reservaSeleccionada.montoTotal).toLocaleString(
                                        "es-CO",
                                        { style: "currency", currency: "COP" }
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#86868b]">Estado</p>
                                <div className="mt-2">
                                    <EstadoReserva estado={reservaSeleccionada.estado} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setReservaSeleccionada(null)}
                            className="mt-8 w-full rounded-xl bg-[#1d1d1f] px-5 py-3 font-semibold text-white hover:bg-black"
                        >
                            Cerrar
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}