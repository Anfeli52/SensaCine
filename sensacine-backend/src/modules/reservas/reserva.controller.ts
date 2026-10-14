import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { ReservaService } from "./reserva.service";

export class ReservaController {
    constructor(private reservaService: ReservaService) {}

    crear = async (req: AuthRequest, res: Response) => {
        const reserva = await this.reservaService.crear(req.usuario!.id, req.body);
        res.status(201).json(reserva);
    };
}
