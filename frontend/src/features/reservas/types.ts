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

export interface AsientoFuncion extends Asiento {
    ocupado: boolean;
}

export interface DisponibilidadFuncion {
    id_funcion: number;
    id_sala: number;
    asientos: AsientoFuncion[];
}
