import { Asiento } from "@prisma/client";

export interface IAsientoRepository {
    getAsientosBySala(hallId: number): Promise<Asiento[]>;
    getFuncionSala(idFuncion: number): Promise<{ id: number; idSala: number } | null>;
    getIdsAsientosOcupados(idFuncion: number): Promise<number[]>;
}

export interface IAsientoNotifier {
    asientosOcupados(idFuncion: number, idsAsiento: number[]): void;
    asientosLiberados(idFuncion: number, idsAsiento: number[]): void;
}
