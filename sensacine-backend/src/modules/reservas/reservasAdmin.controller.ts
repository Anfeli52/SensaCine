import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { ReservasAdminService } from "./reservasAdmin.service";

export class ReservasAdminController {
    constructor(private reservasAdminService: ReservasAdminService) { }

    getAllReservas = async (_req: AuthRequest, res: Response) => {
        const reservas = await this.reservasAdminService.getAllReservas();

        res.status(200).json(reservas);
    };

    getReservaById = async (req: AuthRequest, res: Response) => {
        const idReserva = Number(req.params.id);

        if (!Number.isInteger(idReserva) || idReserva <= 0) {
            res.status(400).json({
                mensaje: "El identificador de la reserva no es válido",
            });
            return;
        }

        const reserva = await this.reservasAdminService.getReservaById(idReserva);

        if (!reserva) {
            res.status(404).json({
                mensaje: "No se encontró la reserva solicitada",
            });
            return;
        }

        res.status(200).json(reserva);
    };

    updateEstado = async (req: AuthRequest, res: Response) => {
        const idReserva = Number(req.params.id);

        if (!Number.isInteger(idReserva) || idReserva <= 0) {
            res.status(400).json({
                mensaje: "El identificador de la reserva no es válido",
            });
            return;
        }

        const { estado } = req.body as { estado: string };

        if (!estado || typeof estado !== "string") {
            res.status(400).json({ mensaje: "El campo 'estado' es requerido" });
            return;
        }

        const reservaActualizada = await this.reservasAdminService.updateEstado(idReserva, estado);

        res.status(200).json(reservaActualizada);
    };
}