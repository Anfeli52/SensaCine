import { apiClient } from "../../../lib/apiClient";
import { CreateFuncionInput, Funcion, FuncionFilters, UpdateFuncionInput } from "../types/programacion.types";

export async function getFunciones(filters?: FuncionFilters): Promise<Funcion[]> {
  const { data } = await apiClient.get<Funcion[]>("/funciones", { params: filters });
  return data;
}

export async function getFuncionById(id: number): Promise<Funcion> {
  const { data } = await apiClient.get<Funcion>(`/funciones/${id}`);
  return data;
}

export async function createFuncion(funcionData: CreateFuncionInput): Promise<Funcion> {
  const { data } = await apiClient.post<Funcion>("/funciones", funcionData);
  return data;
}

export async function updateFuncion(id: number, funcionData: UpdateFuncionInput): Promise<Funcion> {
  const { data } = await apiClient.put<Funcion>(`/funciones/${id}`, funcionData);
  return data;
}

export async function deleteFuncion(id: number): Promise<{ mensaje: string; id: number }> {
  const { data } = await apiClient.delete<{ mensaje: string; id: number }>(`/funciones/${id}`);
  return data;
}
