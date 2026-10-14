import { EstadoReserva } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { ReservasAdminRepository } from "./reservasAdmin.repository";

export class ReservasAdminService {
    constructor(private reservasAdminRepository: ReservasAdminRepository) { }

    async getAllReservas() {
        return this.reservasAdminRepository.getAll();
    }

    async getReservaById(idReserva: number) {
        return this.reservasAdminRepository.getById(idReserva);
    }

    async updateEstado(idReserva: number, estado: string) {
        const estadosValidos: EstadoReserva[] = ["Confirmado", "Cancelado", "Finalizado"];
        if (!estadosValidos.includes(estado as EstadoReserva)) {
            throw new AppError(`Estado inválido. Los estados permitidos son: ${estadosValidos.join(", ")}`, 400);
        }

        const reserva = await this.reservasAdminRepository.getById(idReserva);
        if (!reserva) {
            throw new AppError("Reserva no encontrada", 404);
        }

        return this.reservasAdminRepository.updateEstado(idReserva, estado as EstadoReserva);
    }
}