export type ProductoEstado = "activo" | "inactivo";

export interface AdminProducto {
    id_producto: number;
    id_pelicula: number;
    nombre: string;
    descripcion: string | null;
    categoria: string | null;
    estado: ProductoEstado;
    orden_menu: number | null;
    imagen_url: string | null;
}

export interface CreateProductoInput {
    nombre: string;
    descripcion: string;
    categoria: string;
    estado: ProductoEstado;
    idPelicula: number;
    ordenMenu: number;
    imagenUrl: string;
}

export interface UpdateProductoInput {
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    estado?: ProductoEstado;
    idPelicula?: number;
    ordenMenu?: number;
    imagenUrl?: string;
}