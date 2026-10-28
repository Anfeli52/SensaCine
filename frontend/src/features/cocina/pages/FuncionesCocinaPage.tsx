import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, UtensilsCrossed, ChevronRight, ChefHat } from "lucide-react";
import { obtenerEstadoOrden } from "../types";
import { useFuncionesCocina } from "../hooks/useFuncionesCocina";

type FiltroFecha = "hoy" | "semana" | "todas";

function obtenerFechaHoy(): string {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const anio = partes.find((parte) => parte.type === "year")?.value;
    const mes = partes.find((parte) => parte.type === "month")?.value;
    const dia = partes.find((parte) => parte.type === "day")?.value;

    return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fecha: string): string {
    return new Date(`${fecha.slice(0, 10)}T12:00:00Z`).toLocaleDateString(
        "es-CO",
        {
            timeZone: "UTC",
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );
}

function formatearHora(hora: string): string {
    return hora.slice(11, 16);
}

function obtenerClaveFecha(fecha: string): string {
    return fecha.slice(0, 10);
}

export function FuncionesCocinaPage() {
    const [filtro, setFiltro] = useState<FiltroFecha>("hoy");

    const { data, isLoading, isError, refetch } = useFuncionesCocina();

    const funciones = data?.funciones ?? [];
    const hoy = obtenerFechaHoy();

    const funcionesFiltradas = useMemo(() => {
        const resultado = funciones.filter((funcion) => {
            const fecha = obtenerClaveFecha(funcion.fecha);

            if (filtro === "hoy") {
                return fecha === hoy;
            }

            if (filtro === "semana") {
                const fechaFuncion = new Date(`${fecha}T00:00:00Z`).getTime();
                const fechaInicio = new Date(`${hoy}T00:00:00Z`).getTime();
                const fechaFin = fechaInicio + 6 * 24 * 60 * 60 * 1000;

                return fechaFuncion >= fechaInicio && fechaFuncion <= fechaFin;
            }

            return true;
        });

        return [...resultado].sort((a, b) => {
            const fechaA = `${a.fecha.slice(0, 10)} ${formatearHora(a.horaInicio)}`;
            const fechaB = `${b.fecha.slice(0, 10)} ${formatearHora(b.horaInicio)}`;

            return fechaA.localeCompare(fechaB);
        });
    }, [funciones, filtro, hoy]);

    const funcionesPorFecha = useMemo(() => {
        return funcionesFiltradas.reduce<Record<string, typeof funciones>>(
            (grupos, funcion) => {
                const fecha = obtenerClaveFecha(funcion.fecha);

                if (!grupos[fecha]) {
                    grupos[fecha] = [];
                }

                grupos[fecha].push(funcion);

                return grupos;
            },
            {},
        );
    }, [funcionesFiltradas]);

    if (isLoading) {
        return (
            <main className="mx-auto w-[92%] max-w-6xl py-12 text-gray-900">
                <p className="text-sm text-gray-600">
                    Cargando funciones programadas...
                </p>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="mx-auto w-[92%] max-w-6xl py-12 text-gray-900">
                <h1 className="text-2xl font-bold">Panel de cocina</h1>
                <p className="mt-3 text-sm text-red-700">
                    No fue posible cargar las funciones programadas.
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-4 rounded-lg bg-[#0071e3] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    Intentar de nuevo
                </button>
            </main>
        );
    }

    return (
        <main className="mx-auto w-[92%] max-w-6xl py-8 text-gray-900 sm:py-12">
            <header className="mb-8">
                <p className="text-xs font-semibold tracking-[0.2em] text-blue-700">
                    SENSACINE · OPERACIONES
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Agenda de cocina
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                    Organiza las preparaciones según las próximas funciones y consulta
                    las reservas y restricciones alimentarias de cada una.
                </p>
            </header>

            <section>
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Funciones programadas</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {funcionesFiltradas.length}{" "}
                            {funcionesFiltradas.length === 1 ? "función" : "funciones"}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                { valor: "hoy", texto: "Hoy" },
                                { valor: "semana", texto: "Esta semana" },
                                { valor: "todas", texto: "Todas" },
                            ] as const
                        ).map((opcion) => (
                            <button
                                key={opcion.valor}
                                type="button"
                                onClick={() => setFiltro(opcion.valor)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filtro === opcion.valor
                                        ? "bg-[#0071e3] text-white"
                                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {opcion.texto}
                            </button>
                        ))}
                    </div>
                </div>

                {funcionesFiltradas.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-10 text-center">
                        <CalendarDays className="mx-auto h-8 w-8 text-gray-400" />

                        <h3 className="mt-3 font-semibold text-gray-900">
                            No hay funciones para este periodo
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Prueba con otro periodo para consultar las funciones disponibles.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-8">
                        {Object.entries(funcionesPorFecha).map(([fecha, funcionesDia]) => (
                            <section key={fecha}>
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0071e3]">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold capitalize text-gray-900">
                                            {formatearFecha(fecha)}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {funcionesDia.length}{" "}
                                            {funcionesDia.length === 1 ? "función" : "funciones"}
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    {funcionesDia.map((funcion, indice) => (
                                        <article
                                            key={funcion.id}
                                            className={`flex flex-col gap-4 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-6 ${indice > 0 ? "border-t border-gray-100" : ""
                                                }`}
                                        >
                                            <div className="flex shrink-0 items-center gap-3 sm:w-28">
                                                <Clock3 className="h-4 w-4 text-[#0071e3]" />

                                                <span className="text-lg font-semibold tabular-nums text-gray-900">
                                                    {formatearHora(funcion.horaInicio)}
                                                </span>
                                            </div>

                                            {funcion.pelicula.posterUrl ? (
                                                <img
                                                    src={funcion.pelicula.posterUrl}
                                                    alt={`Póster de ${funcion.pelicula.titulo}`}
                                                    className="hidden h-16 w-11 shrink-0 rounded-md object-cover sm:block"
                                                />
                                            ) : (
                                                <div className="hidden h-16 w-11 shrink-0 items-center justify-center rounded-md bg-gray-100 sm:flex">
                                                    <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    {funcion.pelicula.titulo}
                                                </h4>

                                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {funcion.sala.nombre}
                                                    </span>

                                                    <span className="inline-flex items-center gap-1.5">
                                                        <UtensilsCrossed className="h-3.5 w-3.5" />
                                                        {funcion.pelicula.productos.length}{" "}
                                                        {funcion.pelicula.productos.length === 1
                                                            ? "producto"
                                                            : "productos"}
                                                    </span>

                                                    <span>
                                                        {funcion.totalReservas}{" "}
                                                        {funcion.totalReservas === 1
                                                            ? "reserva"
                                                            : "reservas"}{(() => {
                                                        const ordenesTotales = funcion.reservas.reduce(
                                                            (acc, r) => acc + (r.asientos?.length ?? 0),
                                                            0,
                                                        );
                                                        const ordenesListas = funcion.reservas.reduce(
                                                            (acc, r) =>
                                                                acc +
                                                                (r.asientos?.filter(
                                                                    (a) => obtenerEstadoOrden(a) === "Lista",
                                                                ).length ?? 0),
                                                            0,
                                                        );
                                                        const ordenesEnPrep = funcion.reservas.reduce(
                                                            (acc, r) =>
                                                                acc +
                                                                (r.asientos?.filter(
                                                                    (a) =>
                                                                        obtenerEstadoOrden(a) ===
                                                                        "En_preparacion",
                                                                ).length ?? 0),
                                                            0,
                                                        );

                                                        if (ordenesTotales === 0) return null;

                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
                                                                <ChefHat className="h-3.5 w-3.5 text-[#0071e3]" />
                                                                {ordenesListas} de {ordenesTotales} listas
                                                                {ordenesEnPrep > 0 && (
                                                                    <span className="text-xs text-blue-700">
                                                                        ({ordenesEnPrep} en prep.)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        );
                                                    })()}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/cocina/funciones/${funcion.id}`}
                                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#0071e3] transition-colors hover:border-blue-200 hover:bg-blue-50"
                                            >
                                                Ver detalle
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}