import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { HistorialReservaService } from "./historial.service";

export class HistorialReservaController {
    constructor(private historialService: HistorialReservaService) { }

    crearReserva = async (req: AuthRequest, res: Response) => {
        const idUsuario = req.usuario!.id;
        const reserva = await this.historialService.crearReserva(idUsuario, req.body);
        res.status(201).json(reserva);
    };

    getReservasActivas = async (req: AuthRequest, res: Response) => {
        const idUsuario = req.usuario!.id;

        const reservasActivas = await this.historialService.getReservasActivasByUsuario(idUsuario);

        res.status(200).json(reservasActivas);
    };

    getHistorial = async (req: AuthRequest, res: Response) => {
        const idUsuario = req.usuario!.id;

        const historial = await this.historialService.getHistorialByUsuario(idUsuario);

        res.status(200).json(historial);
    };

    getDetalleReserva = async (req: AuthRequest, res: Response) => {
        const idUsuario = req.usuario!.id;
        const idReserva = Number(req.params.id);

        if (!Number.isInteger(idReserva) || idReserva <= 0) {
            res.status(400).json({
                mensaje: "El identificador de la reserva no es válido",
            });
            return;
        }

        const reserva = await this.historialService.getReservaById(idReserva, idUsuario);

        res.status(200).json(reserva);
    };
}
