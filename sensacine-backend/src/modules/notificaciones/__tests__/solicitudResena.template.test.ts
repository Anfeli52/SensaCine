import { renderSolicitudResena } from "../solicitudResena.template";
import { DatosSolicitudResena } from "../notificacion.types";

const datos: DatosSolicitudResena = {
    idReserva: 12,
    emailDestino: "ana@example.com",
    nombreUsuario: "Ana María Torres",
    pelicula: "Coco",
    fecha: new Date("2026-10-20T00:00:00.000Z"),
    urlResena: "https://sensacine.vercel.app/reservas/historial?resena=12",
};

describe("renderSolicitudResena", () => {
    it("identifica la película en el asunto y en el cuerpo", () => {
        const m = renderSolicitudResena(datos);
        expect(m.to).toBe("ana@example.com");
        expect(m.subject).toContain("Coco");
        expect(m.html).toContain("Coco");
        expect(m.text).toContain("Coco");
    });

    it("incluye el enlace para escribir la reseña en HTML y texto plano", () => {
        const m = renderSolicitudResena(datos);
        expect(m.html).toContain(`href="${datos.urlResena}"`);
        expect(m.text).toContain(datos.urlResena);
    });

    it("saluda por el primer nombre y no desplaza la fecha de la función", () => {
        const m = renderSolicitudResena(datos);
        expect(m.text).toContain("Ana");
        expect(m.text).not.toContain("María");
        expect(m.text).toContain("20 de octubre");
    });

    it("escapa el título de la película para no inyectar HTML", () => {
        const m = renderSolicitudResena({ ...datos, pelicula: '<script>alert("x")</script>' });
        expect(m.html).not.toContain("<script>");
        expect(m.html).toContain("&lt;script&gt;");
    });
});
