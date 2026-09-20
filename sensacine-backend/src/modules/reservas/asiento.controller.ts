import { Request, Response } from "express";
import { AsientoService } from "./asiento.service";

export class AsientoController {
    constructor(private seatService: AsientoService) {}

    getAsientosBySala = async (req: Request, res: Response) => {
        const hallId = parseInt(req.params.id, 10);
        const seats = await this.seatService.getAsientosBySala(hallId);
        
        res.status(200).json(seats);
    }
}