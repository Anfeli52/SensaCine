import { apiClient } from "../../../lib/apiClient";
import { ReservaHistorial } from "../historial.types";

export async function getReservasActivas(): Promise<ReservaHistorial[]> {
    const { data } = await apiClient.get<ReservaHistorial[]>("/reservas/activas");
    return data;
}

export async function getHistorialReservas(): Promise<ReservaHistorial[]> {
    const { data } = await apiClient.get<ReservaHistorial[]>("/reservas/historial");
    return data;
}

export async function getDetalleReserva(id: number): Promise<ReservaHistorial> {
    const { data } = await apiClient.get<ReservaHistorial>(`/reservas/historial/${id}`);
    return data;
}
