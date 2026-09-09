import { apiClient } from "../../../lib/apiClient";
import { LoginDTO, LoginResponseDTO, RegisterDTO, Usuario } from "../types";

export async function loginApi(dto: LoginDTO): Promise<LoginResponseDTO> {
  const { data } = await apiClient.post<LoginResponseDTO>("/auth/login", dto);
  return data;
}

export async function registerApi(dto: RegisterDTO): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>("/auth/register", dto);
  return data;
}
