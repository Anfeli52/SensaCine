import { Asiento } from "@prisma/client";
import { BloqueoActivo } from "./bloqueo.types";

export interface IAsientoRepository {
    getAsientosBySala(hallId: number): Promise<Asiento[]>;
    getFuncionSala(idFuncion: number): Promise<{ id: number; idSala: number } | null>;
    getIdsAsientosOcupados(idFuncion: number): Promise<number[]>;
    getBloqueosActivos(idFuncion: number): Promise<BloqueoActivo[]>;
}

export interface IAsientoNotifier {
    asientosOcupados(idFuncion: number, idsAsiento: number[]): void;
    asientosLiberados(idFuncion: number, idsAsiento: number[]): void;
}
