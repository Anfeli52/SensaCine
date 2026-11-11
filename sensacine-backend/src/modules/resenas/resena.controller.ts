import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { ResenaService } from "./resena.service";

export class ResenaController {
    constructor(private readonly service: ResenaService) {}

    crear = async (req: AuthRequest, res: Response) => {
        const resultado = await this.service.crearResena(req.usuario!.id, req.body);
        res.status(201).json(resultado);
    };
}
