import { AsientoResponseDTO } from "./dtos/AsientoResponseDTO";
import { IAsientoRepository } from "./asiento.types";
import { Asiento } from "@prisma/client";

export class AsientoService {
    constructor(private seatRepository: IAsientoRepository) {}
    
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
}