import { apiClient } from "../../../lib/apiClient";
import { Booking, Asiento, BloqueoCreado, CrearReservaInput, DisponibilidadFuncion, ReservaCreada } from "../types";

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

export async function bloquearAsientos(idFuncion: number, idsAsiento: number[]): Promise<BloqueoCreado> {
    const { data } = await apiClient.post<BloqueoCreado>(`/reservas/funciones/${idFuncion}/bloqueos`, { idsAsiento });
    return data;
}

export async function getMiBloqueo(idFuncion: number): Promise<BloqueoCreado | null> {
    const { data, status } = await apiClient.get<BloqueoCreado>(`/reservas/funciones/${idFuncion}/bloqueos/mio`);
    return status === 204 ? null : data;
}

export async function liberarAsientos(idFuncion: number): Promise<void> {
    await apiClient.delete(`/reservas/funciones/${idFuncion}/bloqueos`);
}

/** Cobra la tarjeta y crea la reserva en una sola operación atómica del servidor */
export async function crearReserva(input: CrearReservaInput): Promise<ReservaCreada> {
    const { data } = await apiClient.post<ReservaCreada>("/reservas", input);
    return data;
}
