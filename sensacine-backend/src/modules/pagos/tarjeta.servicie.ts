import { Tarjeta } from "@prisma/client";
import { TarjetaRepository } from "./tarjeta.repository";
import { CrearTarjetaDTO, TarjetaResponseDTO, UpdateSaldoDTO, ProcesarPagoDTO, ResultadoPagoDTO } from "./dtos/tarjeta.dto";
import { AppError } from "../../common/errors/AppError";

export class TarjetaService {
    constructor(private readonly tarjetaRepo: TarjetaRepository){
    }

    private toDTO(t:Tarjeta): TarjetaResponseDTO{
        return {
            id: t.id,
            idUsuario: t.idUsuario,
            numeroTarjeta: t.numeroTarjeta,
            titular: t.titular,
            fechaExpiracion: t.fechaExpiracion,
            tipo: t.tipo,
            franquicia: t.franquicia,
            saldo: Number(t.saldo),
            estado: t.estado,
            fechaCreacion: t.fechaCreacion
        };
    }

    async listarPorUsuario(idUsuario:number):Promise<TarjetaResponseDTO[]>{
        const tarjetas = await this.tarjetaRepo.obtenerPorUsuario(idUsuario);
        return tarjetas.map(t => 
            this.toDTO(t)
        );
    }

    async crear(idUsuario:number, data: CrearTarjetaDTO):Promise<TarjetaResponseDTO>{
        const tarjeta = await this.tarjetaRepo.crear(idUsuario,data);
        return this.toDTO(tarjeta);
    }

    async actualizarSaldo(idUsuario: number, idTarjeta:number, data:UpdateSaldoDTO): Promise<TarjetaResponseDTO>{
        const tarjeta = await this.tarjetaRepo.obtenerPorId(idTarjeta);
        if(!tarjeta || tarjeta.idUsuario !== idUsuario || tarjeta.estado.toLowerCase() !== 'activa'){
            throw new AppError('Tarjeta no encontrada o no Autorizada', 404);
        }
        const actualizada = await this.tarjetaRepo.actualizarSaldo(tarjeta.id, data);
        return this.toDTO(actualizada);
    };

    async procesarPago(idUsuario: number, idTarjeta: number, data: ProcesarPagoDTO): Promise<ResultadoPagoDTO> {
        const tarjeta = await this.tarjetaRepo.obtenerPorId(idTarjeta);
        if (!tarjeta || tarjeta.idUsuario !== idUsuario || tarjeta.estado.toLowerCase() !== "activa") {
            throw new AppError("Tarjeta no encontrada o no autorizada", 404);
        }

        const saldoActual = Number(tarjeta.saldo);
        if (saldoActual < data.monto) {
            throw new AppError(
                `Saldo insuficiente en la tarjeta seleccionada. Saldo disponible: $${saldoActual.toLocaleString("es-CO")}, Requerido: $${data.monto.toLocaleString("es-CO")}`,
                400
            );
        }

        const nuevoSaldo = saldoActual - data.monto;
        await this.tarjetaRepo.actualizarSaldo(idTarjeta, { nuevoSaldo });

        // =========================================================================
        // TODO (Siguiente HU - Creación de Reserva):
        // Aquí se invocará la creación formal de la reserva en el backend
        // con sus asientos, comensales, orden de cocina y registro en la tabla `pago`.
        // =========================================================================

        return {
            exitoso: true,
            mensaje: "Pago simulado procesado exitosamente",
            referenciaTransaccion: `TX-SENSA-${Date.now()}`,
            montoPagado: data.monto,
            nuevoSaldo,
            tarjetaId: tarjeta.id,
            fechaPago: new Date(),
        };
    }

    async eliminar(idUsuario:number, idTarjeta:number): Promise<void>{
        const tarjeta = await this.tarjetaRepo.obtenerPorId(idTarjeta);
        if(!tarjeta || tarjeta.idUsuario !== idUsuario || tarjeta.estado.toLowerCase() !== "activa" ){
            throw new AppError("Tarjeta inexistente o No Autorizado", 404);
        }
        await this.tarjetaRepo.eliminar(idTarjeta)
    }
}