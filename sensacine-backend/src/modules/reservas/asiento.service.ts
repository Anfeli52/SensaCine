import { AsientoResponseDTO } from "./dtos/AsientoResponseDTO";
import { AppError } from "../../common/errors/AppError";
import { DisponibilidadFuncionDTO } from "./dtos/AsientoDisponibilidadDTO";
import { IAsientoNotifier, IAsientoRepository } from "./asiento.types";
import { Asiento } from "@prisma/client";

export class AsientoService {
    constructor(
        private seatRepository: IAsientoRepository,
        private notifier: IAsientoNotifier
    ) {}
    
    private toDTO(asiento: Asiento): AsientoResponseDTO {
        return {
            id: asiento.id,
            id_sala: asiento.idSala,
            fila: asiento.fila,
            numero: asiento.numero,
        };
    }

    async getAsientosBySala(id_sala: number): Promise<AsientoResponseDTO[]> {
        const asientos = await this.seatRepository.getAsientosBySala(id_sala);
        return asientos.map(asiento => this.toDTO(asiento));
    }

    async getDisponibilidadByFuncion(idFuncion: number): Promise<DisponibilidadFuncionDTO> {
        const funcion = await this.seatRepository.getFuncionSala(idFuncion);
        if (!funcion) throw new AppError("Función no encontrada", 404);

        const [asientos, ocupados] = await Promise.all([
            this.seatRepository.getAsientosBySala(funcion.idSala),
            this.seatRepository.getIdsAsientosOcupados(idFuncion),
        ]);
        const ocupadosSet = new Set(ocupados);

        return {
            id_funcion: funcion.id,
            id_sala: funcion.idSala,
            asientos: asientos.map((a) => ({ ...this.toDTO(a), ocupado: ocupadosSet.has(a.id) })),
        };
    }

    notificarOcupados(idFuncion: number, idsAsiento: number[]) {
        this.notifier.asientosOcupados(idFuncion, idsAsiento);
    }

    notificarLiberados(idFuncion: number, idsAsiento: number[]) {
        this.notifier.asientosLiberados(idFuncion, idsAsiento);
    }
}
