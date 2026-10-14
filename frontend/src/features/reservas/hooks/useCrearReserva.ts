import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearReserva } from "../api/bookingApi";
import { asientosQueryKey } from "./useAsientos";
import { TARJETAS_QUERY_KEY } from "../../pagos/hooks/useTarjetas";

export function useCrearReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearReserva,
    onSuccess: (reserva) => {
      queryClient.invalidateQueries({ queryKey: TARJETAS_QUERY_KEY }); // saldo descontado
      queryClient.invalidateQueries({ queryKey: asientosQueryKey(reserva.idFuncion) });
      queryClient.invalidateQueries({ queryKey: ["reservas", "historial"] });
    },
  });
}
