import { Request, Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { SalaService } from "./sala.service";

export class SalaController {
  constructor(private readonly salaService: SalaService) {}

  listar = async (req: Request, res: Response) => {
    const salas = await this.salaService.listarTodas();
    res.status(200).json(salas);
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const sala = await this.salaService.obtenerPorId(id);
    res.status(200).json(sala);
  };

  crear = async (req: AuthRequest, res: Response) => {
    const nuevaSala = req.usuario
      ? await this.salaService.crear(req.body, req.usuario)
      : await this.salaService.crear(req.body);
    res.status(201).json(nuevaSala);
  };

  actualizar = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const salaActualizada = req.usuario
      ? await this.salaService.actualizar(id, req.body, req.usuario)
      : await this.salaService.actualizar(id, req.body);
    res.status(200).json(salaActualizada);
  };

  eliminar = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const resultado = req.usuario
      ? await this.salaService.eliminar(id, req.usuario)
      : await this.salaService.eliminar(id);
    res.status(200).json(resultado);
  };
}
