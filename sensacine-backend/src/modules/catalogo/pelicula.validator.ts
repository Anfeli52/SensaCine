import { z } from "zod";

export const createPeliculaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio").max(200, "El título no puede superar 200 caracteres"),
  sinopsis: z.string().optional().nullable(),
  duracionMinutos: z.number().int("La duración debe ser un número entero").positive("La duración debe ser mayor a 0"),
  genero: z.string().max(80, "El género no puede superar 80 caracteres").optional().nullable(),
  clasificacion: z.string().max(20, "La clasificación no puede superar 20 caracteres").optional().nullable(),
  posterUrl: z.string().url("El posterUrl debe ser una URL válida").optional().nullable(),
  estado: z.enum(["activa", "inactiva", "proximamente"]).default("activa"),
  precioBaseExperiencia: z.number().nonnegative("El precio base no puede ser negativo"),
});

export const updatePeliculaSchema = createPeliculaSchema.partial();
