export type ProductoEstado = "activo" | "inactivo";

export interface Producto {
  id_producto: number;
  id_pelicula: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: ProductoEstado;
  orden_menu: number;
  imagen_url: string | null;
}