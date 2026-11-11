import { Request, Response } from "express";
import { ResenasService } from "./resena.service";

export class ResenasController {
    constructor(private resenasService: ResenasService) { }

    obtenerPorPelicula = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        const resultado = await this.resenasService.obtenerPorPelicula(id);

        res.status(200).json(resultado);
    };
}
