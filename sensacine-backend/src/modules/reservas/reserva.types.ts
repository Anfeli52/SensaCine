export interface ComensalInput {
    idAsiento: number;
    nombrePersona: string;
    restricciones: string[];
    otraRestriccion?: string;
}

export interface CrearReservaInput {
    idFuncion: number;
    idTarjeta: number;
    comensales: ComensalInput[];
}

export interface FuncionParaReserva {
    id: number;
    idSala: number;
    fecha: Date;
    horaFin: Date;
    estado: string;
    precioAsientoOficial: unknown;
}

export interface TarjetaParaPago {
    id: number;
    idUsuario: number;
    tipo: string;
    estado: string;
    saldo: unknown;
}

export interface ComensalPersistir {
    idAsiento: number;
    nombrePersona: string;
    restricciones: { idRestriccion: number; notas?: string }[];
}

export interface CrearReservaPersistir {
    idUsuario: number;
    idFuncion: number;
    idTarjeta: number;
    monto: number;
    medioPago: string;
    comensales: ComensalPersistir[];
}

export interface ReservaPersistida {
    idReserva: number;
    fechaReserva: Date;
    referenciaTransaccion: string;
    fechaPago: Date;
    nuevoSaldo: number;
}

export type MotivoConflictoReserva = "bloqueo_vencido" | "asiento_reservado" | "saldo_insuficiente";

export class ReservaConflictoError extends Error {
    constructor(public motivo: MotivoConflictoReserva) {
        super(motivo);
        this.name = "ReservaConflictoError";
    }
}

export interface IReservaRepository {
    getFuncion(idFuncion: number): Promise<FuncionParaReserva | null>;
    getAsientosByIds(idsAsiento: number[]): Promise<{ id: number; idSala: number; fila: string; numero: number }[]>;
    getRestriccionesPorNombre(nombres: string[]): Promise<{ id: number; nombre: string }[]>;
    getOrCreateRestriccionOtra(): Promise<{ id: number }>;
    getTarjeta(idTarjeta: number): Promise<TarjetaParaPago | null>;
    /**
     * Una sola transacción: re-valida el bloqueo y los asientos, cobra la tarjeta, crea reserva, asientos,
     * restricciones, órdenes de cocina y pago, y consume el bloqueo. Si algo falla no queda nada a medias.
     */
    crearReservaConfirmada(input: CrearReservaPersistir): Promise<ReservaPersistida>;
}

// Solo lo que la reserva necesita del módulo de bloqueos
export interface IBloqueoVerificador {
    verificarBloqueoVigente(idFuncion: number, idUsuario: number, idsAsiento: number[]): Promise<void>;
}

export interface IReservaNotifier {
    asientosOcupados(idFuncion: number, idsAsiento: number[]): void;
}
