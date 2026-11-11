import { apiClient } from "../../../lib/apiClient";
import { CrearResenaResponse, ResenaInput } from "../types";

export async function crearResena(input: ResenaInput): Promise<CrearResenaResponse> {
    const { data } = await apiClient.post<CrearResenaResponse>("/resenas", input);
    return data;
}
