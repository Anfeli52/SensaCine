import { Asiento } from "@prisma/client";

export interface BloqueoActivo {
    idAsiento: number;
    idUsuario: number;
    expiraEn: Date;
}

export interface IBloqueoRepository {
    getFuncionSala(idFuncion: number): Promise<{ id: number; idSala: number } | null>;
    getAsientosByIds(idsAsiento: number[]): Promise<Asiento[]>;
    getIdsAsientosReservados(idFuncion: number, idsAsiento: number[]): Promise<number[]>;
    /** Bloqueos VIGENTES del usuario en la función (los vencidos no cuentan aunque sigan en BD) */
    getBloqueosUsuario(idFuncion: number, idUsuario: number): Promise<BloqueoActivo[]>;
    /**
     * Operación atómica: borra vencidos, libera TODOS los bloqueos previos del usuario en la función
     * y crea los nuevos con un plazo completo. Lanza ConflictoBloqueoError si algún asiento
     * ya lo tiene otro usuario.
     */
    reemplazarBloqueosUsuario(input: {
        idFuncion: number;
        idUsuario: number;
        idsAsiento: number[];
        duracionMs: number;
    }): Promise<{ bloqueos: BloqueoActivo[]; liberados: number[] }>;
    liberarBloqueosUsuario(idFuncion: number, idUsuario: number): Promise<number[]>;
    /** Borra los bloqueos vencidos y devuelve los asientos liberados agrupados por función. */
    eliminarVencidos(): Promise<Map<number, number[]>>;
}

export interface IBloqueoNotifier {
    asientosPendientes(idFuncion: number, idsAsiento: number[], idUsuario: number): void;
    asientosLiberados(idFuncion: number, idsAsiento: number[]): void;
}

export class ConflictoBloqueoError extends Error {
    constructor(public idsAsiento: number[]) {
        super("Algunos asientos ya no están disponibles");
        this.name = "ConflictoBloqueoError";
    }
}
