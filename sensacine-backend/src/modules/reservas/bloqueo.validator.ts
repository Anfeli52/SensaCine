import { z } from "zod";

export const MAX_ASIENTOS_POR_RESERVA = 8;

export const bloquearAsientosSchema = z.object({
    idsAsiento: z
        .array(z.number().int("ID de asiento inválido").positive("ID de asiento inválido"))
        .min(1, "Selecciona al menos un asiento")
        .max(MAX_ASIENTOS_POR_RESERVA, `Máximo ${MAX_ASIENTOS_POR_RESERVA} asientos por reserva`),
});
