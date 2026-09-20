import { Asiento } from "@prisma/client";

export interface IAsientoRepository {
    getAsientosBySala(hallId: number): Promise<Asiento[]>;
}