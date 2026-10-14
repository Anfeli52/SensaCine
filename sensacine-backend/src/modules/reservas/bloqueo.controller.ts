import { Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { BloqueoService } from "./bloqueo.service";

export class BloqueoController {
    constructor(private bloqueoService: BloqueoService) {}

    private idFuncion(req: AuthRequest): number {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new AppError("Función no válida", 400);
        return id;
    }

    bloquear = async (req: AuthRequest, res: Response) => {
        const bloqueo = await this.bloqueoService.bloquear(
            this.idFuncion(req),
            req.usuario!.id,
            req.body.idsAsiento
        );
        res.status(201).json(bloqueo);
    };

    getMio = async (req: AuthRequest, res: Response) => {
        const bloqueo = await this.bloqueoService.getMiBloqueo(this.idFuncion(req), req.usuario!.id);
        if (!bloqueo) return res.status(204).send();
        res.status(200).json(bloqueo);
    };

    liberar = async (req: AuthRequest, res: Response) => {
        await this.bloqueoService.liberar(this.idFuncion(req), req.usuario!.id);
        res.status(204).send();
    };
}
