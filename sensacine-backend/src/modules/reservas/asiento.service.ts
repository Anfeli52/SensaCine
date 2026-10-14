import { AsientoResponseDTO } from "./dtos/AsientoResponseDTO";
import { AppError } from "../../common/errors/AppError";
import { DisponibilidadFuncionDTO, EstadoAsiento } from "./dtos/AsientoDisponibilidadDTO";
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

    async getDisponibilidadByFuncion(idFuncion: number, idUsuario: number): Promise<DisponibilidadFuncionDTO> {
        const funcion = await this.seatRepository.getFuncionSala(idFuncion);
        if (!funcion) throw new AppError("Función no encontrada", 404);

        const [asientos, ocupados, bloqueos] = await Promise.all([
            this.seatRepository.getAsientosBySala(funcion.idSala),
            this.seatRepository.getIdsAsientosOcupados(idFuncion),
            this.seatRepository.getBloqueosActivos(idFuncion),
        ]);
        const ocupadosSet = new Set(ocupados);
        const bloqueadosSet = new Set(bloqueos.map((b) => b.idAsiento));

        const estadoDe = (id: number): EstadoAsiento => {
            if (ocupadosSet.has(id)) return "ocupado";
            return bloqueadosSet.has(id) ? "pendiente" : "disponible";
        };

        const propios = bloqueos.filter((b) => b.idUsuario === idUsuario && !ocupadosSet.has(b.idAsiento));
        const expiraEn = propios.length ? new Date(Math.min(...propios.map((b) => b.expiraEn.getTime()))) : null;

        return {
            id_funcion: funcion.id,
            id_sala: funcion.idSala,
            asientos: asientos.map((a) => ({ ...this.toDTO(a), estado: estadoDe(a.id) })),
            mi_bloqueo: expiraEn
                ? {
                      ids_asiento: propios.map((b) => b.idAsiento),
                      expira_en: expiraEn.toISOString(),
                      segundos_restantes: Math.max(0, Math.floor((expiraEn.getTime() - Date.now()) / 1000)),
                  }
                : null,
        };
    }

    notificarOcupados(idFuncion: number, idsAsiento: number[]) {
        this.notifier.asientosOcupados(idFuncion, idsAsiento);
    }

    notificarLiberados(idFuncion: number, idsAsiento: number[]) {
        this.notifier.asientosLiberados(idFuncion, idsAsiento);
    }
}
