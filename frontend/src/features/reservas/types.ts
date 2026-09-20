export interface Booking {
    id: number;
    id_user: number;
    id_funcion: number;
    fecha_reserva: string;
    monto_total: number;
    estado: string;
}

export interface Asiento {
    id_seat: number;
    id_hall: number;
    row: string;
    number: number;
    status: string;
}