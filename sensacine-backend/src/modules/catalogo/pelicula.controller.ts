import { Request, Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { PeliculaService } from "./pelicula.service";

export class PeliculaController {
  constructor(private peliculaService: PeliculaService) {}

  listar = async (req: Request, res: Response) => {
    const todas = req.query.todas === "true";
    const peliculas = todas
      ? await this.peliculaService.listarTodas()
      : await this.peliculaService.listarActivas();

    res.status(200).json(peliculas);
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const pelicula = await this.peliculaService.obtenerPorId(id);
    res.status(200).json(pelicula);
  };

  crear = async (req: AuthRequest, res: Response) => {
    const nuevaPelicula = req.usuario
      ? await this.peliculaService.crear(req.body, req.usuario)
      : await this.peliculaService.crear(req.body);
    res.status(201).json(nuevaPelicula);
  };

  actualizar = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const peliculaActualizada = req.usuario
      ? await this.peliculaService.actualizar(id, req.body, req.usuario)
      : await this.peliculaService.actualizar(id, req.body);
    res.status(200).json(peliculaActualizada);
  };

  eliminar = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const resultado = req.usuario
      ? await this.peliculaService.eliminar(id, req.usuario)
      : await this.peliculaService.eliminar(id);
    res.status(200).json(resultado);
  };
}
