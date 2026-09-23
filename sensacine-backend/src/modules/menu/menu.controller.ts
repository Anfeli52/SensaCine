import { Request, Response } from "express";
import { MenuService } from "./menu.service";

export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  obtenerMenuPorPelicula = async (req: Request, res: Response) => { 
    const idPelicula = Number(req.params.id);
    if (!Number.isInteger(idPelicula) || idPelicula <= 0) {
      res.status(400).json({
        error: "El id de la película debe ser un número entero positivo",
      });
      return;
    }

    const productos = await this.menuService.obtenerMenuPorPelicula(idPelicula);
    res.status(200).json(productos);
  };

  obtenerTodos = async (_req: Request, res: Response) => {
    const productos = await this.menuService.obtenerTodosLosProductos();
    res.status(200).json(productos);
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        error: "El id del producto debe ser un número entero positivo",
      });
      return;
    }

    const producto = await this.menuService.obtenerProductoPorId(id);
    res.status(200).json(producto);
  };

  crear = async (req: Request, res: Response) => {
    const producto = await this.menuService.crearProducto(req.body);
    res.status(201).json(producto);
  };

  actualizar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        error: "El id del producto debe ser un número entero positivo",
      });
      return;
    }

    const producto = await this.menuService.actualizarProducto(id, req.body);
    res.status(200).json(producto);
  };

  cambiarEstado = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        error: "El id del producto debe ser un número entero positivo",
      });
      return;
    }

    const producto = await this.menuService.actualizarProducto(id, {estado: req.body.estado});
    res.status(200).json(producto);
  };

  eliminar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        error: "El id del producto debe ser un número entero positivo",
      });
      return;
    }

    const resultado = await this.menuService.eliminarProducto(id)
    res.status(200).json(resultado);
  };
}