import { NotificacionService } from "../notificacion.service";
import { DatosConfirmacionReserva, IEmailSender, INotificacionRepository } from "../notificacion.types";

const datos: DatosConfirmacionReserva = {
    idReserva: 9,
    emailDestino: "medinadiaza45@gmail.com",
    nombreUsuario: "Andrés Medina",
    pelicula: "Coco",
    sala: "Sala 1",
    fecha: new Date("2026-10-20T00:00:00.000Z"),
    horaInicio: new Date("1970-01-01T14:00:00.000Z"),
    horaFin: new Date("1970-01-01T16:00:00.000Z"),
    asientos: [{ fila: "B", numero: 3, nombrePersona: "Ana" }],
    montoPagado: 32000,
    referenciaTransaccion: "TX-1",
};

function setup(over: Partial<INotificacionRepository> = {}, sender?: IEmailSender) {
    const repo: INotificacionRepository = {
        obtenerOCrearConfirmacion: jest.fn(async () => ({ id: 5, estado: "pendiente" })),
        getDatosConfirmacion: jest.fn(async () => datos),
        marcarEnviada: jest.fn(async () => undefined),
        marcarFallida: jest.fn(async () => undefined),
        ...over,
    };
    const emailSender: IEmailSender = sender ?? { send: jest.fn(async () => undefined) };
    return { repo, emailSender, service: new NotificacionService(repo, emailSender) };
}

describe("NotificacionService.enviarConfirmacionReserva", () => {
    it("envía el correo al email registrado del usuario y marca la notificación como enviada", async () => {
        const { service, repo, emailSender } = setup();
        await service.enviarConfirmacionReserva(9);

        expect(emailSender.send).toHaveBeenCalledTimes(1);
        const mensaje = (emailSender.send as jest.Mock).mock.calls[0][0];
        expect(mensaje.to).toBe("medinadiaza45@gmail.com");
        expect(mensaje.subject).toContain("#9");
        expect(mensaje.subject).toContain("Coco");
        expect(repo.marcarEnviada).toHaveBeenCalledWith(5);
        expect(repo.marcarFallida).not.toHaveBeenCalled();
    });

    it("si el envío falla marca la notificación como fallida y NO lanza", async () => {
        const { service, repo } = setup({}, { send: jest.fn(async () => { throw new Error("535 credenciales inválidas"); }) });
        await expect(service.enviarConfirmacionReserva(9)).resolves.toBeUndefined();
        expect(repo.marcarFallida).toHaveBeenCalledWith(5);
        expect(repo.marcarEnviada).not.toHaveBeenCalled();
    });

    it("no reenvía si la notificación ya estaba enviada", async () => {
        const { service, emailSender } = setup({ obtenerOCrearConfirmacion: jest.fn(async () => ({ id: 5, estado: "enviado" })) });
        await service.enviarConfirmacionReserva(9);
        expect(emailSender.send).not.toHaveBeenCalled();
    });

    it("reserva inexistente: queda fallida sin lanzar ni enviar", async () => {
        const { service, repo, emailSender } = setup({ getDatosConfirmacion: jest.fn(async () => null) });
        await expect(service.enviarConfirmacionReserva(9)).resolves.toBeUndefined();
        expect(emailSender.send).not.toHaveBeenCalled();
        expect(repo.marcarFallida).toHaveBeenCalledWith(5);
    });

    it("usuario sin correo: queda fallida sin enviar", async () => {
        const { service, repo, emailSender } = setup({ getDatosConfirmacion: jest.fn(async () => ({ ...datos, emailDestino: "" })) });
        await service.enviarConfirmacionReserva(9);
        expect(emailSender.send).not.toHaveBeenCalled();
        expect(repo.marcarFallida).toHaveBeenCalledWith(5);
    });

    it("si falla hasta el registro en BD tampoco lanza", async () => {
        const { service } = setup({ obtenerOCrearConfirmacion: jest.fn(async () => { throw new Error("db caída"); }) });
        await expect(service.enviarConfirmacionReserva(9)).resolves.toBeUndefined();
    });
});
