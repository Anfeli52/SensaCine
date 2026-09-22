import { AppError } from "../../common/errors/AppError";
import { MenuRepository } from "./menu.repository";
import { MenuProductoResponseDTO } from "./dtos/ProductoResponseDTO";

export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  async obtenerMenuPorPelicula( idPelicula: number): Promise<MenuProductoResponseDTO[]> {
    const peliculaExiste = await this.menuRepository.peliculaExiste(idPelicula);
    if (!peliculaExiste) {
      throw new AppError("La película no existe", 404);
    }

    const productos = await this.menuRepository.obtenerProductosPorPelicula(idPelicula);

    return productos.map((producto) => ({
      id_producto: producto.id,
      id_pelicula: producto.idPelicula!,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      estado: producto.estado,
      orden_menu: producto.ordenMenu,
      imagen_url: producto.imagenUrl,
    }));
  }
}