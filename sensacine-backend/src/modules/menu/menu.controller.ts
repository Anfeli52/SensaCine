import { Request, Response } from "express";
import { MenuService } from "./menu.service";

export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  obtenerMenuPorPelicula = async (req: Request, res: Response) => {const idPelicula = Number(req.params.id);
    if (!Number.isInteger(idPelicula) || idPelicula <= 0) {
      res.status(400).json({
        error: "El id de la película debe ser un número entero positivo",
      });
      return;
    }

    const productos = await this.menuService.obtenerMenuPorPelicula(idPelicula);
    res.status(200).json(productos);
  };
}