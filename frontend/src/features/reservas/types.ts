export interface Booking {
    id: number;
    id_user: number;
    id_funcion: number;
    fecha_reserva: string;
    monto_total: number;
    estado: string;
}

export interface Asiento {
    id: number;
    id_sala: number;
    fila: string;
    numero: number;
}

export type SeatStatus = "available" | "selected" | "occupied";
