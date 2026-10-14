import { z } from "zod";
import { MAX_ASIENTOS_POR_RESERVA } from "./bloqueo.validator";

const comensalSchema = z.object({
    idAsiento: z.number().int("ID de asiento inválido").positive("ID de asiento inválido"),
    nombrePersona: z
        .string()
        .trim()
        .min(1, "Indica el nombre de cada comensal")
        .max(100, "El nombre no puede superar 100 caracteres"),
    restricciones: z.array(z.string().trim().min(1).max(100)).max(10, "Demasiadas restricciones").default([]),
    otraRestriccion: z.string().trim().max(255, "La restricción adicional no puede superar 255 caracteres").optional(),
});

export const crearReservaSchema = z.object({
    idFuncion: z.number().int("Función no válida").positive("Función no válida"),
    idTarjeta: z.number().int("Tarjeta no válida").positive("Tarjeta no válida"),
    comensales: z
        .array(comensalSchema)
        .min(1, "Selecciona al menos un asiento")
        .max(MAX_ASIENTOS_POR_RESERVA, `Máximo ${MAX_ASIENTOS_POR_RESERVA} asientos por reserva`),
});
