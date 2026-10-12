import { useQuery } from "@tanstack/react-query";
import { getReservaAdminById, getReservasAdmin } from "../api/reservasApi";

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