import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getTarjetas, 
  crearTarjeta, 
  actualizarSaldoTarjeta, 
  procesarPagoTarjeta, 
  eliminarTarjeta 
} from "../api/tarjetaApi";
import { CrearTarjetaInput, UpdateSaldoInput, ProcesarPagoInput } from "../types";

export const TARJETAS_QUERY_KEY = ["tarjetas"];

export function useTarjetas() {
  return useQuery({
    queryKey: TARJETAS_QUERY_KEY,
    queryFn: getTarjetas,
  });
}

export function useCrearTarjeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearTarjetaInput) => crearTarjeta(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TARJETAS_QUERY_KEY });
    },
  });
}

export function useActualizarSaldo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateSaldoInput }) =>
      actualizarSaldoTarjeta(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TARJETAS_QUERY_KEY });
    },
  });
}

export function useProcesarPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProcesarPagoInput }) =>
      procesarPagoTarjeta(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TARJETAS_QUERY_KEY });
    },
  });
}

export function useEliminarTarjeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarTarjeta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TARJETAS_QUERY_KEY });
    },
  });
}
