import { apiClient } from "../../../lib/apiClient";
import { Rol, UsuarioAdmin } from "../types/usuario.types";

export async function getUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await apiClient.get<UsuarioAdmin[]>("/admin/usuarios");
  return data;
}

export async function updateUsuarioRol( id: number, rol: Rol): Promise<UsuarioAdmin> {
  const { data } = await apiClient.patch<UsuarioAdmin>(`/admin/usuarios/${id}/rol`,{ rol });
  return data;
}

export async function updateUsuarioEstado( id: number, estado: "activo" | "inactivo"): Promise<UsuarioAdmin> {
  const { data } = await apiClient.patch<UsuarioAdmin>(`/admin/usuarios/${id}/estado`,{ estado });
  return data;
}