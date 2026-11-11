import { crearResenaSchema } from "../registroResena.validator";

const ok = { idReserva: 1, calificacionPelicula: 4, calificacionExperiencia: 5, comentario: "  Genial  " };

describe("crearResenaSchema", () => {
    it("acepta una reseña válida y recorta el comentario", () => {
        const r = crearResenaSchema.safeParse(ok);
        expect(r.success && r.data.comentario).toBe("Genial");
    });

    it("el comentario es opcional y vacío se guarda como null", () => {
        const sin = crearResenaSchema.safeParse({ ...ok, comentario: undefined });
        const vacio = crearResenaSchema.safeParse({ ...ok, comentario: "   " });
        expect(sin.success && sin.data.comentario).toBeNull();
        expect(vacio.success && vacio.data.comentario).toBeNull();
    });

    it.each([0, 6, 3.5, "4"])("rechaza calificación inválida %p", (valor) => {
        expect(crearResenaSchema.safeParse({ ...ok, calificacionPelicula: valor }).success).toBe(false);
        expect(crearResenaSchema.safeParse({ ...ok, calificacionExperiencia: valor }).success).toBe(false);
    });

    it("exige ambas calificaciones y la reserva", () => {
        expect(crearResenaSchema.safeParse({ idReserva: 1 }).success).toBe(false);
        expect(crearResenaSchema.safeParse({ ...ok, idReserva: 0 }).success).toBe(false);
    });

    it("rechaza comentarios de más de 1000 caracteres", () => {
        expect(crearResenaSchema.safeParse({ ...ok, comentario: "a".repeat(1001) }).success).toBe(false);
    });
});
