import { AppError } from "../../common/errors/AppError";
import { MenuRepository } from "./menu.repository";
import { MenuProductoResponseDTO } from "./dtos/ProductoResponseDTO";
import { CreateProductoDTO } from "./dtos/CreateProductoDTO";
import { UpdateProductoDTO } from "./dtos/UpdateProductoDTO";
import { Producto } from "@prisma/client";

export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) { }

    private toDTO(producto: Producto): MenuProductoResponseDTO {
    return {
      id_producto: producto.id,
      id_pelicula: producto.idPelicula!,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      estado: producto.estado,
      orden_menu: producto.ordenMenu,
      imagen_url: producto.imagenUrl
    };
  }

  async obtenerMenuPorPelicula(idPelicula: number): Promise<MenuProductoResponseDTO[]> {
    const peliculaExiste = await this.menuRepository.peliculaExiste(idPelicula);

    if (!peliculaExiste) {
      throw new AppError("La película no existe", 404);
    }

    const productos = await this.menuRepository.obtenerProductosPorPelicula(idPelicula);
    return productos.map((p) => (this.toDTO(p)));
  }

  async obtenerTodosLosProductos(): Promise<MenuProductoResponseDTO[]> {
    const productos = await this.menuRepository.obtenerTodosLosProductos();
    return productos.map((p) => (this.toDTO(p)));
  }

  async obtenerProductoPorId(id: number): Promise<MenuProductoResponseDTO> {
    const producto = await this.menuRepository.obtenerProductoPorId(id);

    if (!producto) {
      throw new AppError("Producto gastronómico no encontrado", 404);
    }
    return this.toDTO(producto);
  }

  async crearProducto(dto: CreateProductoDTO): Promise<MenuProductoResponseDTO> {
    const peliculaExiste = await this.menuRepository.peliculaExiste(dto.idPelicula);
    if (!peliculaExiste) {
      throw new AppError("La película no existe", 404);
    }

    const ordenExiste = await this.menuRepository.ordenMenuExiste(dto.idPelicula, dto.ordenMenu);
    if (ordenExiste) {
      throw new AppError(
        "Ya existe un producto con ese número de orden para esta película",
        400
      );
    }

    const producto = await this.menuRepository.crearProducto(dto);
    return this.toDTO(producto);
  }

  async actualizarProducto(id: number, dto: UpdateProductoDTO): Promise<MenuProductoResponseDTO> {
    const productoExistente = await this.menuRepository.obtenerProductoPorId(id);

    if (!productoExistente) {
      throw new AppError("Producto gastronómico no encontrado", 404);
    }

    const idPelicula = dto.idPelicula ?? productoExistente.idPelicula;
    const ordenMenu = dto.ordenMenu ?? productoExistente.ordenMenu;

    if (idPelicula !== null && ordenMenu !== null) {
      const ordenExiste = await this.menuRepository.ordenMenuExiste(idPelicula, ordenMenu, id);

      if (ordenExiste) {
        throw new AppError(
          "Ya existe otro producto con ese número de orden para esta película",
          400
        );
      }
    }

    if (
      dto.idPelicula !== undefined &&
      !(await this.menuRepository.peliculaExiste(dto.idPelicula))
    ) {
      throw new AppError("La película no existe", 404);
    }

    const productoActualizado = await this.menuRepository.actualizarProducto(id, dto);
    return this.toDTO(productoActualizado);
  }

  async eliminarProducto(id: number) {
    const productoExistente = await this.menuRepository.obtenerProductoPorId(id);

    if (!productoExistente) {
      throw new AppError("Producto gastronómico no encontrado", 404);
    }

    try {
      await this.menuRepository.eliminarProducto(id);

      return { mensaje: "Producto gastronómico eliminado exitosamente", id };

    } catch (error: any) {
      if (error?.code === "P2003") {
        throw new AppError(
          "No se puede eliminar el producto porque tiene restricciones o reservas asociadas. Puedes cambiar su estado a 'inactivo'.",
          400
        );
      }

      throw error;
    }
  }
}