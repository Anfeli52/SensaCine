import { Response } from "express";
import { AuthRequest } from "../../common/middlewares/authMiddleware";
import { TarjetaService } from "./tarjeta.servicie";

export class TarjetaController {
  constructor(private readonly tarjetaService: TarjetaService) {}

  listar = async (req: AuthRequest, res: Response) => {
    const tarjetas = await this.tarjetaService.listarPorUsuario(req.usuario!.id);
    res.status(200).json(tarjetas);
  };

  crear = async (req: AuthRequest, res: Response) => {
    const nueva = await this.tarjetaService.crear(req.usuario!.id, req.body);
    res.status(201).json(nueva);
  };

  cambiarSaldo = async (req: AuthRequest, res: Response) => {
    const idTarjeta = Number(req.params.id);
    const tarjeta = await this.tarjetaService.actualizarSaldo(req.usuario!.id, idTarjeta, req.body);
    res.status(200).json(tarjeta);
  };
  

  eliminar = async (req: AuthRequest, res: Response) => {
    const idTarjeta = Number(req.params.id);
    await this.tarjetaService.eliminar(req.usuario!.id, idTarjeta);
    res.status(204).send();
  };
}
