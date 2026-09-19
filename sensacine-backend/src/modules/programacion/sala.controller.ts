import { Request, Response } from "express";
import { SalaService } from "./sala.service";

export class SalaController {
  constructor(private salaService: SalaService) {}

  listar = async (_req: Request, res: Response) => {
    const salas = await this.salaService.listarTodas();
    res.status(200).json(salas);
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const sala = await this.salaService.obtenerPorId(id);
    res.status(200).json(sala);
  };

  crear = async (req: Request, res: Response) => {
    const nuevaSala = await this.salaService.crear(req.body);
    res.status(201).json(nuevaSala);
  };

  actualizar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const salaActualizada = await this.salaService.actualizar(id, req.body);
    res.status(200).json(salaActualizada);
  };

  eliminar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const resultado = await this.salaService.eliminar(id);
    res.status(200).json(resultado);
  };
}
