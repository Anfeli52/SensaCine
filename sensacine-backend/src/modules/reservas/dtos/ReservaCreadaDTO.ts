export interface ReservaCreadaDTO {
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
