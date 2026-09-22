import { z } from "zod";

export const createSalaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre de la sala es obligatorio")
    .max(80, "El nombre no puede superar 80 caracteres"),
  filas: z
    .number()
    .int("Las filas deben ser un número entero")
    .min(1, "Debe tener al menos 1 fila")
    .max(26, "Máximo 26 filas (A-Z)")
    .optional(),
  asientosPorFila: z
    .number()
    .int("Los asientos por fila deben ser un número entero")
    .min(1, "Debe tener al menos 1 asiento por fila")
    .max(50, "Máximo 50 asientos por fila")
    .optional(),
  capacidad: z
    .number()
    .int("La capacidad debe ser un número entero")
    .positive("La capacidad debe ser mayor a 0")
    .optional(),
  estado: z.enum(["activa", "inactiva", "mantenimiento"]).default("activa"),
});

export const updateSalaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre de la sala es obligatorio")
    .max(80, "El nombre no puede superar 80 caracteres")
    .optional(),
  estado: z.enum(["activa", "inactiva", "mantenimiento"]).optional(),
});
