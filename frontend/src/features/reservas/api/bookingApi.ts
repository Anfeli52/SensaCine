import { apiClient } from "../../../lib/apiClient";
import { Booking, Asiento } from "../types";

export async function getBookingById(id: number): Promise<Booking> {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
} 

export async function getSeatsByHall(id: number): Promise<Asiento[]> {
    const { data } = await apiClient.get<Asiento[]>(`/halls/${id}/seats`);
    return data;
}