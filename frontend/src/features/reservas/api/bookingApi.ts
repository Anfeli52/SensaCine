import { apiClient } from "../../../lib/apiClient";
import { Booking, Asiento, DisponibilidadFuncion } from "../types";

export async function getBookingById(id: number): Promise<Booking> {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
} 

export async function getSeatsByHall(id: number): Promise<Asiento[]> {
    const { data } = await apiClient.get<Asiento[]>(`/reservas/halls/${id}/seats`);
    return data;
}

export async function getDisponibilidadByFuncion(idFuncion: number): Promise<DisponibilidadFuncion> {
    const { data } = await apiClient.get<DisponibilidadFuncion>(`/reservas/funciones/${idFuncion}/seats`);
    return data;
}
