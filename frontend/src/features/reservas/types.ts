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

export type SeatStatus = "available" | "selected" | "pending" | "occupied";

export type EstadoAsiento = "disponible" | "pendiente" | "ocupado";

export interface AsientoFuncion extends Asiento {
    estado: EstadoAsiento;
}

export interface MiBloqueo {
    ids_asiento: number[];
    expira_en: string;
    segundos_restantes: number;
}

export interface BloqueoCreado extends MiBloqueo {
    id_funcion: number;
}

export interface DisponibilidadFuncion {
    id_funcion: number;
    id_sala: number;
    asientos: AsientoFuncion[];
    mi_bloqueo: MiBloqueo | null;
}

export interface AsientoDetalleReserva {
    asiento: Asiento;
    nombrePersona: string;
    tieneAlergias: boolean;
    alergias: string[];
    otraAlergia?: string;
}

export interface ComensalReservaInput {
    idAsiento: number;
    nombrePersona: string;
    restricciones: string[];
    otraRestriccion?: string;
}

export interface CrearReservaInput {
    idFuncion: number;
    idTarjeta: number;
    comensales: ComensalReservaInput[];
}

export interface ReservaCreada {
    idReserva: number;
    idFuncion: number;
    estado: string;
    montoTotal: number;
    fechaReserva: string;
    asientos: { idAsiento: number; fila: string; numero: number; nombrePersona: string }[];
    pago: {
        referenciaTransaccion: string;
        montoPagado: number;
        nuevoSaldo: number;
        tarjetaId: number;
        fechaPago: string;
    };
}
