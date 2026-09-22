export interface MenuProductoResponseDTO {
  id_producto: number;
  id_pelicula: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  estado: string;
  orden_menu: number | null;
  imagen_url: string | null;
}