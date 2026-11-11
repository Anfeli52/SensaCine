import { z } from "zod";

export const MAX_COMENTARIO_RESENA = 1000;

const calificacion = (campo: string) =>
    z
        .number({ invalid_type_error: `Calificación de ${campo} no válida`, required_error: `Califica ${campo}` })
        .int(`Calificación de ${campo} no válida`)
        .min(1, `Califica ${campo} de 1 a 5`)
        .max(5, `Califica ${campo} de 1 a 5`);

export const crearResenaSchema = z.object({
    idReserva: z.number().int("Reserva no válida").positive("Reserva no válida"),
    calificacionPelicula: calificacion("la película"),
    calificacionExperiencia: calificacion("la experiencia"),
    comentario: z
        .string()
        .trim()
        .max(MAX_COMENTARIO_RESENA, `El comentario no puede superar ${MAX_COMENTARIO_RESENA} caracteres`)
        .optional()
        .transform((v) => (v ? v : null)),
});
