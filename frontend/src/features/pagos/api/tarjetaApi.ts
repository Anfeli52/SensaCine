import { apiClient } from "../../../lib/apiClient";
import { 
  Tarjeta, 
  CrearTarjetaInput, 
  UpdateSaldoInput, 
  ProcesarPagoInput, 
  ResultadoPago 
} from "../types";

export async function getTarjetas(): Promise<Tarjeta[]> {
  const { data } = await apiClient.get<Tarjeta[]>("/tarjetas");
  return data;
}

export async function crearTarjeta(input: CrearTarjetaInput): Promise<Tarjeta> {
  const { data } = await apiClient.post<Tarjeta>("/tarjetas", input);
  return data;
}

export async function actualizarSaldoTarjeta(id: number, input: UpdateSaldoInput): Promise<Tarjeta> {
  const { data } = await apiClient.patch<Tarjeta>(`/tarjetas/${id}/saldo`, input);
  return data;
}

export async function procesarPagoTarjeta(id: number, input: ProcesarPagoInput): Promise<ResultadoPago> {
  const { data } = await apiClient.post<ResultadoPago>(`/tarjetas/${id}/pagar`, input);
  return data;
}

export async function eliminarTarjeta(id: number): Promise<void> {
  await apiClient.delete(`/tarjetas/${id}`);
}
