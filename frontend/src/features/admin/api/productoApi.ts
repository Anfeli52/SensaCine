import { apiClient } from "../../../lib/apiClient";
import { AdminProducto, CreateProductoInput, UpdateProductoInput } from "../types/producto.types";

export async function getProductos(): Promise<AdminProducto[]> {
    const { data } = await apiClient.get<AdminProducto[]>("/productos");
    return data;
}

export async function getProductoById(id: number): Promise<AdminProducto> {
    const { data } = await apiClient.get<AdminProducto>(`/productos/${id}`);
    return data;
}

export async function createProducto(productoData: CreateProductoInput): Promise<AdminProducto> {
    const { data } = await apiClient.post<AdminProducto>("/productos", productoData);
    return data;
}

export async function updateProducto(id: number, productoData: UpdateProductoInput): Promise<AdminProducto> {
    const { data } = await apiClient.put<AdminProducto>(`/productos/${id}`, productoData);
    return data;
}

export async function deleteProducto(id: number): Promise<{ mensaje: string; id: number }> {
    const { data } = await apiClient.delete<{mensaje: string; id: number;}>(`/productos/${id}`);
    return data;
}