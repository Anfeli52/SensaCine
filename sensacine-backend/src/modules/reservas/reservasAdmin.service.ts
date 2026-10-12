import { ReservasAdminRepository } from "./reservasAdmin.repository";

export class ReservasAdminService {
    constructor(private reservasAdminRepository: ReservasAdminRepository) { }

    async getAllReservas() {
        return this.reservasAdminRepository.getAll();
    }

    async getReservaById(idReserva: number) {
        return this.reservasAdminRepository.getById(idReserva);
    }
}