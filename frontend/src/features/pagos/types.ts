export interface Tarjeta {
  id: number;
  idUsuario: number;
  numeroTarjeta: string;
  titular: string;
  fechaExpiracion: string;
  tipo: string;
  franquicia: string;
  saldo: number;
  estado: string;
  fechaCreacion: string;
}

export interface CrearTarjetaInput {
  numeroTarjeta: string;
  titular: string;
  fechaExpiracion: string;
  tipo?: string;
  franquicia?: string;
  saldo?: number;
}

export interface UpdateSaldoInput {
  nuevoSaldo: number;
}

export interface ProcesarPagoInput {
  monto: number;
  descripcion?: string;
}

export interface ResultadoPago {
  exitoso: boolean;
  mensaje: string;
  referenciaTransaccion: string;
  montoPagado: number;
  nuevoSaldo: number;
  tarjetaId: number;
  fechaPago: string;
}
