import { useState } from "react";
import { Clock, ChefHat, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { AsistenteCocina, EstadoOrden } from "../types";
import { obtenerEstadoOrden, obtenerIdOrden } from "../types";
import { useActualizarEstadoOrden } from "../hooks/useActualizarEstadoOrden";

interface OrdenCocinaItemProps {
    asistente: AsistenteCocina;
    idReserva: number;
    titularReserva: string;
    funcionId: number;
}

export function OrdenCocinaItem({
    asistente,
    idReserva,
    titularReserva,
    funcionId,
}: OrdenCocinaItemProps) {
    const estadoActual = obtenerEstadoOrden(asistente);
    const idOrden = obtenerIdOrden(asistente) ?? asistente.id;

    const { mutate: actualizarEstado, isPending } = useActualizarEstadoOrden();
    const [estadoPendienteSeleccionado, setEstadoPendienteSeleccionado] =
        useState<EstadoOrden | null>(null);

    const handleCambiarEstado = (nuevoEstado: EstadoOrden) => {
        if (nuevoEstado === estadoActual || isPending) return;
        setEstadoPendienteSeleccionado(nuevoEstado);
        actualizarEstado(
            { idOrden, nuevoEstado, funcionId },
            {
                onSettled: () => {
                    setEstadoPendienteSeleccionado(null);
                },
            },
        );
    };

    const configEstado: Record<
        EstadoOrden,
        { texto: string; badgeClase: string; Icono: typeof Clock }
    > = {
        Pendiente: {
            texto: "Pendiente",
            badgeClase: "bg-amber-100 text-amber-900 border-amber-300",
            Icono: Clock,
        },
        En_preparacion: {
            texto: "En preparación",
            badgeClase: "bg-blue-100 text-blue-900 border-blue-300",
            Icono: ChefHat,
        },
        Lista: {
            texto: "Lista",
            badgeClase: "bg-emerald-100 text-emerald-900 border-emerald-300",
            Icono: CheckCircle2,
        },
    };

    const estadoInfo = configEstado[estadoActual] || configEstado.Pendiente;
    const IconoEstado = estadoInfo.Icono;

    return (
        <article
            className={`rounded-xl border p-4 transition-all shadow-sm sm:p-5 ${
                estadoActual === "Lista"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : estadoActual === "En_preparacion"
                      ? "border-blue-200 bg-blue-50/20"
                      : "border-gray-200 bg-white"
            }`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                            {asistente.nombrePersona?.trim() || "Asistente sin nombre"}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                            Asiento{" "}
                            {`${asistente.asiento.fila ?? ""}${asistente.asiento.numero ?? ""}`.trim() ||
                                `ID ${asistente.asiento.id}`}
                        </span>
                        <span className="text-xs text-gray-500">
                            (Reserva #{idReserva} · Titular: {titularReserva})
                        </span>
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                        Orden #{idOrden}
                    </div>
                </div>

                {/* Badge de estado actual */}
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${estadoInfo.badgeClase}`}
                    >
                        <IconoEstado className="h-3.5 w-3.5" />
                        {estadoInfo.texto}
                    </span>
                </div>
            </div>

            {/* Restricciones alimentarias si existen */}
            {asistente.restricciones.length > 0 ? (
                <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 p-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Restricciones alimentarias:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {asistente.restricciones.map((r) => (
                            <span
                                key={r.id}
                                className="inline-flex items-center rounded-md border border-amber-300 bg-white px-2 py-0.5 text-xs font-medium text-amber-900"
                            >
                                {r.restriccion.nombre}
                                {r.restriccion.tipo ? ` (${r.restriccion.tipo})` : ""}
                                {r.producto ? ` · Para: ${r.producto.nombre}` : ""}
                                {r.notas ? ` · ${r.notas}` : ""}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="mt-2 text-xs text-gray-500">
                    Sin restricciones alimentarias registradas
                </p>
            )}

            {/* Controles para cambiar de estado */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="text-xs font-medium text-gray-600">
                    Marcar estado de preparación:
                </span>

                <div className="flex flex-wrap gap-1.5">
                    {(
                        [
                            { valor: "Pendiente", texto: "Pendiente" },
                            { valor: "En_preparacion", texto: "En preparación" },
                            { valor: "Lista", texto: "Lista" },
                        ] as const
                    ).map((opcion) => {
                        const esActual = estadoActual === opcion.valor;
                        const estaCargando =
                            isPending && estadoPendienteSeleccionado === opcion.valor;

                        return (
                            <button
                                key={opcion.valor}
                                type="button"
                                disabled={isPending || esActual}
                                onClick={() => handleCambiarEstado(opcion.valor)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                    esActual
                                        ? opcion.valor === "Pendiente"
                                            ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-300"
                                            : opcion.valor === "En_preparacion"
                                              ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                                              : "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300"
                                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                                } disabled:cursor-not-allowed disabled:opacity-80`}
                            >
                                {estaCargando && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {opcion.texto}
                            </button>
                        );
                    })}
                </div>
            </div>
        </article>
    );
}

