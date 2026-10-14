import { useQuery } from "@tanstack/react-query";
import { getDetalleReserva, getHistorialReservas, getReservasActivas } from "../api/historialApi";

export function useReservasActivas() {
    return useQuery({
        queryKey: ["reservas", "activas"],
        queryFn: getReservasActivas,
    });
}

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
