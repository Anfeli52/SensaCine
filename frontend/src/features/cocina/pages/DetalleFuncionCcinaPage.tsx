import { Link, useParams } from "react-router-dom";
import { useDetalleFuncionCocina } from "../hooks/useDetalleFuncionCocina";

function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString("es-CO", {
        timeZone: "UTC",
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

    if (!id || !Number.isInteger(funcionId) || funcionId <= 0) {
        return <p>El identificador de la función no es válido.</p>;
    }

    if (isLoading) {
        return <p>Cargando detalle de la función...</p>;
    }

    if (isError || !funcion) {
        return (
            <main className="cocina-page">
                <p>No fue posible consultar el detalle de esta función.</p>
                <button type="button" onClick={() => refetch()}>
                    Intentar de nuevo
                </button>
                <p>
                    <Link to="/cocina">Volver a las funciones</Link>
                </p>
            </main>
        );
    }


    return (
        <main className="mx-auto w-[92%] max-w-6xl py-8 text-[#f5f5f7] sm:py-12">
            <Link
                to="/cocina"
                className="inline-flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
            >
                <span aria-hidden="true">←</span>
                Volver a las funciones
            </Link>

            <header className="mb-10 mt-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-blue-400">
                    SENSACINE · OPERACIONES
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {funcion.pelicula.titulo}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
                    <span>{funcion.sala.nombre}</span>
                    <span>{formatearFecha(funcion.fecha)}</span>
                    <span>{formatearHora(funcion.horaInicio)}</span>
                </div>

                <p className="mt-4 text-sm text-gray-400">
                    {funcion.totalReservas}{" "}
                    {funcion.totalReservas === 1 ? "reserva registrada" : "reservas registradas"}
                </p>
            </header>

            <section className="mb-12">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">Menú de la experiencia</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Productos que componen la experiencia gastronómica de esta película.
                    </p>
                </div>

                {funcion.pelicula.productos.length === 0 ? (
                    <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-gray-400">
                        Esta película no tiene productos activos en su menú.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {funcion.pelicula.productos.map((producto) => (

                            <article
                                key={producto.id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
                            >
                                {producto.imagenUrl && (
                                    <img
                                        src={producto.imagenUrl}
                                        alt={producto.nombre}
                                        loading="lazy"
                                        className="h-48 w-full object-cover"
                                    />
                                )}

                                <div className="p-5">
                                    <p className="text-xs font-medium uppercase tracking-wider text-blue-700">
                                        {producto.categoria ?? "Producto"}
                                    </p>

                                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                                        {producto.nombre}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                        {producto.descripcion || "Sin descripción disponible."}
                                    </p>
                                </div>
                            </article>

                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Reservas y restricciones alimentarias
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Consulta los asistentes y sus indicaciones para preparar cada pedido.
                    </p>
                </div>

                {funcion.reservas.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="font-medium text-gray-900">Todavía no hay reservas</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            Cuando existan reservas para esta función, sus asistentes y
                            restricciones aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {funcion.reservas.map((reserva) => (
                            <details
                                key={reserva.id}
                                className="group rounded-xl border border-gray-200 bg-white"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900">
                                            Reserva #{reserva.id}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-600">
                                            Titular: {reserva.usuario.nombre}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {reserva.asientos.length}{" "}
                                            {reserva.asientos.length === 1
                                                ? "asistente"
                                                : "asistentes"}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${reserva.estado.toLowerCase() === "confirmado"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : reserva.estado.toLowerCase() === "cancelado"
                                                        ? "bg-red-100 text-red-800"
                                                        : reserva.estado.toLowerCase() === "finalizado"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-amber-100 text-amber-800"
                                                }`}
                                        >
                                            {reserva.estado}
                                        </span>

                                        <span className="text-gray-500 transition-transform group-open:rotate-180">
                                            ▼
                                        </span>
                                    </div>
                                </summary>

                                <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
                                    <div className="space-y-3">
                                        {reserva.asientos.map((asistente) => (
                                            <div
                                                key={asistente.id}
                                                className="rounded-lg border border-gray-100 p-3"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h4 className="text-sm font-semibold text-gray-900">
                                                        {asistente.nombrePersona?.trim() ||
                                                            "Asistente sin nombre"}
                                                    </h4>

                                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                        Asiento{" "}
                                                        {
                                                            `${asistente.asiento.fila ?? ""}${asistente.asiento.numero ?? ""}`.trim() ||
                                                            `ID ${asistente.asiento.id}`}
                                                    </span>
                                                </div>

                                                {asistente.restricciones.length === 0 ? (
                                                    <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                                                        Sin restricciones registradas
                                                    </p>
                                                ) : (
                                                    <div className="mt-3">
                                                        <p className="mb-2 text-xs font-medium text-gray-600">
                                                            Restricciones alimentarias
                                                        </p>

                                                        <div className="flex flex-wrap gap-2">
                                                            {asistente.restricciones.map(
                                                                (restriccion) => (
                                                                    <span
                                                                        key={restriccion.id}
                                                                        title={[
                                                                            restriccion.notas,
                                                                            restriccion.producto
                                                                                ? `Producto: ${restriccion.producto.nombre}`
                                                                                : null,
                                                                        ]
                                                                            .filter(Boolean)
                                                                            .join(" · ") || undefined}
                                                                        className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900"
                                                                    >
                                                                        {restriccion.restriccion.nombre}
                                                                        {restriccion.restriccion.tipo
                                                                            ? ` · ${restriccion.restriccion.tipo}`
                                                                            : ""}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>

                                                        {asistente.restricciones.some(
                                                            (restriccion) =>
                                                                restriccion.notas ||
                                                                restriccion.producto,
                                                        ) && (
                                                                <div className="mt-2 space-y-1">
                                                                    {asistente.restricciones
                                                                        .filter(
                                                                            (restriccion) =>
                                                                                restriccion.notas ||
                                                                                restriccion.producto,
                                                                        )
                                                                        .map((restriccion) => (
                                                                            <p
                                                                                key={restriccion.id}
                                                                                className="text-xs leading-5 text-gray-600"
                                                                            >
                                                                                <span className="font-medium text-gray-800">
                                                                                    {
                                                                                        restriccion.restriccion
                                                                                            .nombre
                                                                                    }
                                                                                    :
                                                                                </span>{" "}
                                                                                {restriccion.notas
                                                                                    ? restriccion.notas
                                                                                    : ""}
                                                                                {restriccion.producto
                                                                                    ? ` · Producto: ${restriccion.producto.nombre}`
                                                                                    : ""}
                                                                            </p>
                                                                        ))}
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        ))}

                    </div>
                )}
            </section>
        </main>
    );

}
