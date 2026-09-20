import { Request, Response } from "express";
import { FuncionService } from "./funcion.service";

export class FuncionController {
  constructor(private readonly funcionService: FuncionService) {}

  listar = async (req: Request, res: Response) => {
    const filters = {
      fecha: req.query.fecha as string | undefined,
      idSala: req.query.idSala ? Number(req.query.idSala) : undefined,
      idPelicula: req.query.idPelicula ? Number(req.query.idPelicula) : undefined,
      estado: req.query.estado as string | undefined,
      desdeFecha: req.query.desdeFecha as string | undefined,
      hastaFecha: req.query.hastaFecha as string | undefined,
      soloFuturas: req.query.soloFuturas === "true",
    };


    const funciones = await this.funcionService.listar(filters);
    res.status(200).json(funciones);
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const funcion = await this.funcionService.obtenerPorId(id);
    res.status(200).json(funcion);
  };

  crear = async (req: Request, res: Response) => {
    const nuevaFuncion = await this.funcionService.crear(req.body);
    res.status(201).json(nuevaFuncion);
  };

  actualizar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const funcionActualizada = await this.funcionService.actualizar(id, req.body);
    res.status(200).json(funcionActualizada);
  };

  eliminar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const resultado = await this.funcionService.eliminar(id);
    res.status(200).json(resultado);
  };
}
