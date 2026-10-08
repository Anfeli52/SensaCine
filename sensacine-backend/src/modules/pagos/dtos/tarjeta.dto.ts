export interface CrearTarjetaDTO {
    numeroTarjeta: string;
    titular: string;
    fechaExpiracion: string;
    tipo?: string;
    franquicia?: string;
    saldo?: number;
}

export interface UpdateSaldoDTO {
    nuevoSaldo: number;
}

export interface TarjetaResponseDTO {
    id: number;
    idUsuario: number;
    numeroTarjeta: string; // Puede venir enmascarado o completo
    titular: string;
    fechaExpiracion: string;
    tipo: string;
    franquicia: string;
    saldo: number;
    estado: string;
    fechaCreacion: Date;
}

