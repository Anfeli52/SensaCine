import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { RegistroResenaService } from "./registroResena.service";

export class RegistroResenaController {
    constructor(private readonly service: RegistroResenaService) {}

    crear = async (req: AuthRequest, res: Response) => {
        const resultado = await this.service.crearResena(req.usuario!.id, req.body);
        res.status(201).json(resultado);
    };
}
