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

    // Solo bloqueos vigentes: los vencidos se ignoran aunque el barrendero aún no los haya borrado
    getBloqueosActivos(idFuncion: number) {
        return prisma.bloqueoAsiento.findMany({
            where: { idFuncion, expiraEn: { gt: new Date() } },
            select: { idAsiento: true, idUsuario: true, expiraEn: true },
        });
    }
}
