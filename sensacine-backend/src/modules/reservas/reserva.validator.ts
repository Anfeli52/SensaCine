import { z } from "zod";

export const crearReservaSchema = z.object({
  idFuncion: z.number().int().positive("El identificador de la función debe ser válido"),
  montoTotal: z.number().positive("El monto total debe ser mayor a cero"),
  medioPago: z.string().optional().default("tarjeta_credito"),
  referenciaTransaccion: z.string().optional(),
  asientos: z
    .array(
      z.object({
        idAsiento: z.number().int().positive("El identificador del asiento debe ser válido"),
        nombrePersona: z.string().optional().default("Comensal"),
        alergias: z.array(z.string()).optional().default([]),
      })
    )
    .min(1, "Debe seleccionar al menos un asiento para la reserva"),
});

export type CrearReservaDTO = z.infer<typeof crearReservaSchema>;
