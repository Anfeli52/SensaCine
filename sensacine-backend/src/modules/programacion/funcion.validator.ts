import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createFuncionSchema = z.object({
  idPelicula: z.number().int("El ID de la película debe ser un entero").positive("Película no válida"),
  idSala: z.number().int("El ID de la sala debe ser un entero").positive("Sala no válida"),
  fecha: z
    .string()
    .refine((val) => dateRegex.test(val) || !isNaN(Date.parse(val)), {
      message: "La fecha debe tener formato YYYY-MM-DD",
    }),
  horaInicio: z
    .string()
    .refine((val) => timeRegex.test(val) || !isNaN(Date.parse(val)), {
      message: "La hora de inicio debe tener formato HH:mm (ej. 15:30)",
    }),
  horaFin: z
    .string()
    .refine((val) => timeRegex.test(val) || !isNaN(Date.parse(val)), {
      message: "La hora de fin debe tener formato HH:mm",
    })
    .optional(),
  precioAsientoOficial: z
    .number()
    .nonnegative("El precio oficial no puede ser negativo"),
  estado: z.enum(["programada", "en_curso", "finalizada", "cancelada"]).default("programada"),
});

export const updateFuncionSchema = createFuncionSchema.partial();
