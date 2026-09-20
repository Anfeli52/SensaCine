import { prisma } from "../../infrastructure/prisma/client";
import { IAsientoRepository } from "./asiento.types";

export class PrismaAsientoRepository implements IAsientoRepository {
    getAsientosBySala(id_sala: number) {
        return prisma.asiento.findMany({ where: { idSala: id_sala } });
    }
}