export interface CreateProductoDTO {
    nombre: string;
    descripcion: string;
    categoria: string;
    estado?: string;
    idPelicula: number;
    ordenMenu: number;
    imagenUrl: string;
}