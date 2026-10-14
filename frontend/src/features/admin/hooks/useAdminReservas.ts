import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReservaAdminById, getReservasAdmin, updateEstadoReservaAdmin } from "../api/reservasApi";

export const ADMIN_RESERVAS_QUERY_KEY = ["reservas", "admin"];

export function useAdminReservas() {
    return useQuery({
        queryKey: ADMIN_RESERVAS_QUERY_KEY,
        queryFn: getReservasAdmin,
    });
}

export function useAdminReservaDetalle(id: number) {
    return useQuery({
        queryKey: [...ADMIN_RESERVAS_QUERY_KEY, id],
        queryFn: () => getReservaAdminById(id),
        enabled: Number.isInteger(id) && id > 0,
    });
}

export function useActualizarEstadoReserva() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: string }) =>
            updateEstadoReservaAdmin(id, estado),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ADMIN_RESERVAS_QUERY_KEY });
        },
    });
}