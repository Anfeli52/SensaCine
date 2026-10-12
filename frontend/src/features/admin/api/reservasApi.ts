import { apiClient } from "../../../lib/apiClient";
import { Reserva } from "../types/reservas.types";

export async function getReservasAdmin(): Promise<Reserva[]> {
    const { data } = await apiClient.get<Reserva[]>("/reservas/admin");
    return data;
}

export async function getReservaAdminById(id: number): Promise<Reserva> {
    const { data } = await apiClient.get<Reserva>(`/reservas/admin/${id}`);
    return data;
}