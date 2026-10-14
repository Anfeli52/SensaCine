import { AppError } from "../../common/errors/AppError";
import { HistorialReservaRepository } from "./historial.repository";

export class HistorialReservaService {
    constructor(private historialRepository: HistorialReservaRepository) { }

    async getReservasActivasByUsuario(idUsuario: number) {
        return this.historialRepository.getReservasActivasByUsuario(idUsuario);
    }

    async getHistorialByUsuario(idUsuario: number) {
        return this.historialRepository.getHistorialByUsuario(idUsuario);
    }

    async getReservaById(idReserva: number, idUsuario: number) {
        const reserva = await this.historialRepository.getReservaById(idReserva,idUsuario);

        if (!reserva) {
            throw new AppError("Reserva no encontrada", 404);
        }

        return reserva;
    }
}
