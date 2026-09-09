import { AuthResponseDTO } from "./AuthResponseDTO";

export interface LoginResponseDTO {
  token: string;
  usuario: AuthResponseDTO;
}
