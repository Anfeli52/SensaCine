import { prisma } from "../../infrastructure/prisma/client";
import { IAsientoRepository } from "./asiento.types";

export class PrismaAsientoRepository implements IAsientoRepository {
    getAsientosBySala(id_sala: number) {
        return prisma.asiento.findMany({ where: { idSala: id_sala } });
    }

    getFuncionSala(idFuncion: number) {
        return prisma.funcion.findUnique({
            where: { id: idFuncion },
            select: { id: true, idSala: true },
        });
    }

    async getIdsAsientosOcupados(idFuncion: number) {
        const filas = await prisma.reservaAsiento.findMany({
            where: { reserva: { idFuncion, estado: { not: "Cancelado" } } },
            select: { idAsiento: true },
        });
        return filas.map((f) => f.idAsiento);
    }
}
