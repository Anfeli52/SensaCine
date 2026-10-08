import { prisma } from "../../infrastructure/prisma/client";
import { CrearTarjetaDTO, UpdateSaldoDTO } from "./dtos/tarjeta.dto";
import { Tarjeta } from "@prisma/client";

export class TarjetaRepository {
    async obtenerPorUsuario(idUsuario: number): Promise<Tarjeta[]> {
        return prisma.tarjeta.findMany({
            where: { idUsuario, estado: 'activa' },
            orderBy: { fechaCreacion: "desc" }
        })
    }

    async obtenerPorId(id: number): Promise<Tarjeta | null> {
        return prisma.tarjeta.findUnique({
            where: { id }
        })
    }

    async crear(idUsuario: number, data: CrearTarjetaDTO): Promise<Tarjeta> {
        return prisma.tarjeta.create({
            data: {
                idUsuario,
                ...data
            }
        })
    }

    async actualizarSaldo(id: number, data: UpdateSaldoDTO): Promise<Tarjeta> {
        return prisma.tarjeta.update({
            where: { id },
            data: { saldo: data.nuevoSaldo }
        })
    }

    async eliminar(id: number): Promise<Tarjeta> {
        return prisma.tarjeta.update({
            where: { id },
            data: { estado: 'inactiva' }
        })
    }

}

