import { Tarjeta } from "@prisma/client";
import { TarjetaRepository } from "./tarjeta.repository";
import { CrearTarjetaDTO, TarjetaResponseDTO, UpdateSaldoDTO } from "./dtos/tarjeta.dto";
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
        if(!tarjeta || tarjeta.idUsuario !== idUsuario || tarjeta.estado !== 'Activa'){
            throw new AppError('Tarjeta no encontrada o no Autorizada', 404);
        }
        const actualizada = await this.tarjetaRepo.actualizarSaldo(tarjeta.id, data);
        return this.toDTO(actualizada);
    };
}