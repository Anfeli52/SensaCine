import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { CocinaService } from "./cocina.service";

export class CocinaController {
  constructor(private readonly cocinaService: CocinaService) {}

  listarFuncionesProgramadas = async (req: AuthRequest, res: Response) => {
    const resultado = await this.cocinaService.listarFuncionesProgramadas();

    // Soporte para arreglo plano si se solicita con ?formato=array
    if (req.query.formato === "array") {
      res.status(200).json(resultado.funciones);
      return;
    }

    res.status(200).json(resultado);
  };

  obtenerFuncionPorId = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensaje: "El identificador de la función no es válido",
      });
      return;
    }

    const funcion = await this.cocinaService.obtenerFuncionConReservas(id);
    res.status(200).json(funcion);
  };

  actualizarEstadoOrden = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensaje: "El identificador de la orden no es válido",
      });
      return;
    }

    const { estado } = req.body;
    const resultado = await this.cocinaService.actualizarEstadoOrden(id, estado);
    res.status(200).json(resultado);
  };

  obtenerOrdenPorId = async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensaje: "El identificador de la orden no es válido",
      });
      return;
    }

    const orden = await this.cocinaService.obtenerOrdenPorId(id);
    res.status(200).json(orden);
  };
}
