import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearResena } from "../api/resenaApi";

export function useCrearResena() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: crearResena,
        // El historial incluye la reseña de cada reserva: se refresca para mostrarla y ocultar el botón
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservas"] }),
    });
}
