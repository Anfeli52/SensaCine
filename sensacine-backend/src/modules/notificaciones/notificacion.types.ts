export interface MensajeCorreo {
    to: string;
    subject: string;
    html: string;
    text: string;
}

// Puerto de salida: el servicio no sabe si el correo sale por SMTP, una API HTTP o un doble de pruebas
export interface IEmailSender {
    send(mensaje: MensajeCorreo): Promise<void>;
}

export interface DatosConfirmacionReserva {
    idReserva: number;
    emailDestino: string;
    nombreUsuario: string;
    pelicula: string;
    sala: string;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    asientos: { fila: string; numero: number; nombrePersona: string | null }[];
    montoPagado: number;
    referenciaTransaccion: string | null;
}

export interface DatosSolicitudResena {
    idReserva: number;
    emailDestino: string;
    nombreUsuario: string;
    pelicula: string;
    fecha: Date;
    urlResena: string;
}

// Reserva confirmada cuya invitación a reseñar aún no se ha generado
export interface ReservaCandidataResena {
    idReserva: number;
    fecha: Date;
    horaFin: Date;
}

export interface NotificacionPendiente {
    id: number;
    estado: string;
}

export interface INotificacionRepository {
    obtenerOCrearConfirmacion(idReserva: number): Promise<NotificacionPendiente>;
    getDatosConfirmacion(idReserva: number): Promise<DatosConfirmacionReserva | null>;
    /**
     * Reservas Confirmadas, de funciones de `desde` en adelante, sin invitación a reseñar
     * (ni enviada ni fallida) y sin reseña escrita. El filtro "ya terminó" lo aplica el servicio.
     */
    getCandidatasSolicitudResena(desde: Date): Promise<ReservaCandidataResena[]>;
    obtenerOCrearSolicitudResena(idReserva: number): Promise<NotificacionPendiente>;
    getDatosSolicitudResena(idReserva: number): Promise<DatosSolicitudResena | null>;
    marcarEnviada(idNotificacion: number): Promise<void>;
    marcarFallida(idNotificacion: number): Promise<void>;
}

// Lo que necesita el módulo de reservas: avisar que una reserva quedó confirmada
export interface IConfirmacionReservaNotifier {
    enviarConfirmacionReserva(idReserva: number): Promise<void>;
}

// Lo que necesita el barrendero de server.ts: invitar a reseñar las funciones que ya terminaron
export interface ISolicitudResenaNotifier {
    enviarSolicitudesResena(ahora?: Date): Promise<number>;
}
