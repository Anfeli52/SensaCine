import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cocinaApi } from "../api/cocinaApi";
import type { EstadoOrden, FuncionCocina, ListadoFuncionesCocinaResponse } from "../types";

export function useActualizarEstadoOrden() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            idOrden,
            nuevoEstado,
        }: {
            idOrden: number;
            nuevoEstado: EstadoOrden;
            funcionId?: number;
        }) => cocinaApi.actualizarEstadoOrden(idOrden, nuevoEstado),

        onMutate: async ({ idOrden, nuevoEstado, funcionId }) => {
            // Cancelar refetches salientes
            await queryClient.cancelQueries({ queryKey: ["cocina"] });

            // Capturar estado anterior
            const prevFuncion = funcionId
                ? queryClient.getQueryData<FuncionCocina>(["cocina", "funciones", funcionId])
                : undefined;
            const prevListado = queryClient.getQueryData<ListadoFuncionesCocinaResponse>([
                "cocina",
                "funciones",
            ]);

            // Actualización optimista del detalle de la función
            if (funcionId && prevFuncion) {
                const nuevaFuncion: FuncionCocina = {
                    ...prevFuncion,
                    reservas: prevFuncion.reservas.map((reserva) => ({
                        ...reserva,
                        asientos: reserva.asientos.map((asistente) => {
                            const ordenActual = asistente.ordenesCocina?.[0];
                            if (ordenActual && ordenActual.id === idOrden) {
                                return {
                                    ...asistente,
                                    ordenesCocina: [{ ...ordenActual, estado: nuevoEstado }],
                                };
                            }
                            if (asistente.id === idOrden) {
                                return {
                                    ...asistente,
                                    ordenesCocina: [
                                        {
                                            id: ordenActual?.id ?? idOrden,
                                            idReservaAsiento: asistente.id,
                                            estado: nuevoEstado,
                                        },
                                    ],
                                };
                            }
                            return asistente;
                        }),
                    })),
                };
                queryClient.setQueryData(["cocina", "funciones", funcionId], nuevaFuncion);
            }

            return { prevFuncion, prevListado };
        },

        onError: (_err, variables, context) => {
            if (variables.funcionId && context?.prevFuncion) {
                queryClient.setQueryData(
                    ["cocina", "funciones", variables.funcionId],
                    context.prevFuncion,
                );
            }
            if (context?.prevListado) {
                queryClient.setQueryData(["cocina", "funciones"], context.prevListado);
            }
        },

        onSettled: (_data, _error, variables) => {
            if (variables.funcionId) {
                queryClient.invalidateQueries({
                    queryKey: ["cocina", "funciones", variables.funcionId],
                });
            }
            queryClient.invalidateQueries({ queryKey: ["cocina", "funciones"] });
        },
    });
}

