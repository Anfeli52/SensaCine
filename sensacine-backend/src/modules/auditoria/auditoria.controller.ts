import { Request, Response } from "express";
import { AuditoriaService } from "./auditoria.service";
import { queryAuditoriaSchema } from "./auditoria.validator";

export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  listar = async (req: Request, res: Response) => {
    const filtros = queryAuditoriaSchema.parse(req.query);
    const resultado = await this.auditoriaService.listar(filtros);
    res.status(200).json(resultado);
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const log = await this.auditoriaService.obtenerPorId(id);
    res.status(200).json(log);
  };
}

