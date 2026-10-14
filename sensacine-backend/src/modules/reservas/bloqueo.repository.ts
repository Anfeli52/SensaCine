import { Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";
import { BloqueoActivo, ConflictoBloqueoError, IBloqueoRepository } from "./bloqueo.types";

export class PrismaBloqueoRepository implements IBloqueoRepository {
    getFuncionSala(idFuncion: number) {
        return prisma.funcion.findUnique({
            where: { id: idFuncion },
            select: { id: true, idSala: true },
        });
    }

    getAsientosByIds(idsAsiento: number[]) {
        return prisma.asiento.findMany({ where: { id: { in: idsAsiento } } });
    }

    async getIdsAsientosReservados(idFuncion: number, idsAsiento: number[]) {
        const filas = await prisma.reservaAsiento.findMany({
            where: {
                idAsiento: { in: idsAsiento },
                reserva: { idFuncion, estado: { not: "Cancelado" } },
            },
            select: { idAsiento: true },
        });
        return filas.map((f) => f.idAsiento);
    }

    async reemplazarBloqueosUsuario({ idFuncion, idUsuario, idsAsiento, duracionMs }: {
        idFuncion: number;
        idUsuario: number;
        idsAsiento: number[];
        duracionMs: number;
    }) {
        try {
            return await prisma.$transaction(async (tx) => {
                const ahora = new Date();

                // 1. Bloqueos vencidos de esta función ya no cuentan
                await tx.bloqueoAsiento.deleteMany({ where: { idFuncion, expiraEn: { lte: ahora } } });

                // 2. Se liberan TODOS los bloqueos previos del usuario: cada "Continuar" empieza un plazo nuevo
                const propios = await tx.bloqueoAsiento.findMany({ where: { idFuncion, idUsuario } });
                if (propios.length) await tx.bloqueoAsiento.deleteMany({ where: { idFuncion, idUsuario } });
                const aLiberar = propios.map((b) => b.idAsiento).filter((id) => !idsAsiento.includes(id));

                // 3. Lo que quede en esos asientos pertenece a otro usuario
                const ajenos = await tx.bloqueoAsiento.findMany({
                    where: { idFuncion, idAsiento: { in: idsAsiento } },
                    select: { idAsiento: true },
                });
                if (ajenos.length) throw new ConflictoBloqueoError(ajenos.map((b) => b.idAsiento));

                const expiraEn = new Date(ahora.getTime() + duracionMs);
                await tx.bloqueoAsiento.createMany({
                    data: idsAsiento.map((idAsiento) => ({ idFuncion, idAsiento, idUsuario, expiraEn })),
                });

                const bloqueos: BloqueoActivo[] = idsAsiento.map((idAsiento) => ({ idAsiento, idUsuario, expiraEn }));
                return { bloqueos, liberados: aLiberar };
            });
        } catch (e) {
            // Carrera: otro usuario insertó el mismo asiento entre la lectura y el insert
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                throw new ConflictoBloqueoError(idsAsiento);
            }
            throw e;
        }
    }

    getBloqueosUsuario(idFuncion: number, idUsuario: number) {
        return prisma.bloqueoAsiento.findMany({
            where: { idFuncion, idUsuario, expiraEn: { gt: new Date() } },
            select: { idAsiento: true, idUsuario: true, expiraEn: true },
        });
    }

    async liberarBloqueosUsuario(idFuncion: number, idUsuario: number) {
        const propios = await prisma.bloqueoAsiento.findMany({
            where: { idFuncion, idUsuario },
            select: { idAsiento: true },
        });
        if (!propios.length) return [];
        await prisma.bloqueoAsiento.deleteMany({ where: { idFuncion, idUsuario } });
        return propios.map((b) => b.idAsiento);
    }

    async eliminarVencidos() {
        const vencidos = await prisma.bloqueoAsiento.findMany({
            where: { expiraEn: { lte: new Date() } },
            select: { id: true, idFuncion: true, idAsiento: true },
        });
        const porFuncion = new Map<number, number[]>();
        if (!vencidos.length) return porFuncion;

        await prisma.bloqueoAsiento.deleteMany({ where: { id: { in: vencidos.map((v) => v.id) } } });
        for (const v of vencidos) porFuncion.set(v.idFuncion, [...(porFuncion.get(v.idFuncion) ?? []), v.idAsiento]);
        return porFuncion;
    }
}
