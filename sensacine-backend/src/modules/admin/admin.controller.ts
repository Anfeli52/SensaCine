import { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminController {
  constructor(private adminService: AdminService) {}

  obtenerUsuarios = async (req: Request, res: Response) => {
    const usuarios = await this.adminService.obtenerUsuarios();
    res.status(200).json(usuarios);
  };

  actualizarRol = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const usuario = await this.adminService.actualizarRol(id, req.body.rol);
    res.status(200).json(usuario);
  };

  actualizarEstado = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const usuario = await this.adminService.actualizarEstado(id, req.body.estado);
    res.status(200).json(usuario);
  };
}