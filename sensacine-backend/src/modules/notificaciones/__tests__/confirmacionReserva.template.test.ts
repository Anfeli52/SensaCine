import { escapeHtml, renderConfirmacionReserva } from "../confirmacionReserva.template";
import { DatosConfirmacionReserva } from "../notificacion.types";

const datos: DatosConfirmacionReserva = {
    idReserva: 42,
    emailDestino: "medinadiaza45@gmail.com",
    nombreUsuario: "Andrés Medina",
    pelicula: "Oppenheimer",
    sala: "Sala 2 - IMAX Laser Sensorial",
    fecha: new Date("2026-10-13T00:00:00.000Z"), // @db.Date: medianoche UTC
    horaInicio: new Date("1970-01-01T19:00:00.000Z"),
    horaFin: new Date("1970-01-01T22:00:00.000Z"),
    asientos: [
        { fila: "E", numero: 8, nombrePersona: "Luis Prueba" },
        { fila: "E", numero: 7, nombrePersona: "Andrés Medina" },
    ],
    montoPagado: 64000,
    referenciaTransaccion: "TX-SENSA-123-42",
};

describe("renderConfirmacionReserva", () => {
    const msg = renderConfirmacionReserva(datos);

    it("va dirigido al correo registrado y el asunto identifica la reserva confirmada", () => {
        expect(msg.to).toBe("medinadiaza45@gmail.com");
        expect(msg.subject).toBe("Reserva #42 confirmada - Oppenheimer");
    });

    it.each([
        ["película", "Oppenheimer"],
        ["fecha (sin desplazar el día por zona horaria)", "Martes, 13 de octubre de 2026"],
        ["hora", "19:00 - 22:00"],
        ["sala", "Sala 2 - IMAX Laser Sensorial"],
        ["monto pagado", "64.000"],
        ["referencia de pago", "TX-SENSA-123-42"],
        ["nombre del comensal", "Luis Prueba"],
    ])("incluye %s en el HTML y en el texto plano", (_nombre, esperado) => {
        expect(msg.html).toContain(esperado);
        expect(msg.text).toContain(esperado);
    });

    it("muestra las sillas ordenadas", () => {
        expect(msg.text).toContain("Sillas: E7 (Andrés Medina), E8 (Luis Prueba)");
        expect(msg.html.indexOf("E7")).toBeLessThan(msg.html.indexOf("E8"));
    });

    it("deja claro que la reserva fue confirmada", () => {
        expect(msg.html).toContain("Reserva confirmada");
        expect(msg.text).toContain("¡Tu reserva está confirmada, Andrés!");
    });

    it("escapa el HTML de los datos escritos por el usuario", () => {
        const hostil = renderConfirmacionReserva({
            ...datos,
            asientos: [{ fila: "A", numero: 1, nombrePersona: '<img src=x onerror="alert(1)">' }],
        });
        expect(hostil.html).not.toContain("<img src=x");
        expect(hostil.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    });

    it("funciona sin referencia de pago ni nombre de comensal", () => {
        const m = renderConfirmacionReserva({
            ...datos,
            referenciaTransaccion: null,
            asientos: [{ fila: "A", numero: 1, nombrePersona: null }],
        });
        expect(m.text).not.toContain("Referencia de pago");
        expect(m.text).toContain("Sillas: A1");
    });

    it("escapeHtml neutraliza los caracteres especiales", () => {
        expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
    });
});
