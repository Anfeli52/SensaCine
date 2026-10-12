import { useQuery } from "@tanstack/react-query";
import { getDetalleReserva, getHistorialReservas } from "../api/historialApi";

export function useHistorialReservas() {
    return useQuery({
        queryKey: ["reservas", "historial"],
        queryFn: getHistorialReservas,
    });
}

export function useDetalleReserva(id: number | null) {
    return useQuery({
        queryKey: ["reservas", "historial", id],
        queryFn: () => getDetalleReserva(id!),
        enabled: id !== null,
    });
}
