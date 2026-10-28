import { NotificacionService, VENTANA_SOLICITUD_RESENA_DIAS } from "../notificacion.service";
import { DatosSolicitudResena, IEmailSender, INotificacionRepository, ReservaCandidataResena } from "../notificacion.types";

const datos = (idReserva: number): DatosSolicitudResena => ({
    idReserva,
    emailDestino: `u${idReserva}@example.com`,
    nombreUsuario: "Ana",
    pelicula: "Coco",
    fecha: new Date("2026-10-20T00:00:00.000Z"),
    urlResena: `https://app/reservas/historial?resena=${idReserva}`,
});

// "Ahora" = 20 oct 2026 18:00 en Bogotá (UTC-5) = 23:00 UTC
const AHORA = new Date("2026-10-20T23:00:00.000Z");

const candidata = (idReserva: number, fecha: string, horaFin: string): ReservaCandidataResena => ({
    idReserva,
    fecha: new Date(`${fecha}T00:00:00.000Z`),
    horaFin: new Date(`1970-01-01T${horaFin}:00.000Z`),
});

function setup(candidatas: ReservaCandidataResena[], over: Partial<INotificacionRepository> = {}, sender?: IEmailSender) {
    const repo: INotificacionRepository = {
        obtenerOCrearConfirmacion: jest.fn(),
        getDatosConfirmacion: jest.fn(),
        getCandidatasSolicitudResena: jest.fn(async () => candidatas),
        obtenerOCrearSolicitudResena: jest.fn(async (id: number) => ({ id: id * 10, estado: "pendiente" })),
        getDatosSolicitudResena: jest.fn(async (id: number) => datos(id)),
        marcarEnviada: jest.fn(async () => undefined),
        marcarFallida: jest.fn(async () => undefined),
        ...over,
    };
    const emailSender: IEmailSender = sender ?? { send: jest.fn(async () => undefined) };
    return { repo, emailSender, service: new NotificacionService(repo, emailSender) };
}

describe("NotificacionService.enviarSolicitudesResena", () => {
    it("invita solo a las reservas cuya función ya terminó", async () => {
        const { service, emailSender } = setup([
            candidata(1, "2026-10-19", "23:00"), // ayer: terminó
            candidata(2, "2026-10-20", "17:30"), // hoy, terminó 17:30 < 18:00
            candidata(3, "2026-10-20", "19:00"), // hoy, aún no termina
            candidata(4, "2026-10-21", "10:00"), // mañana
        ]);

        const enviadas = await service.enviarSolicitudesResena(AHORA);

        expect(enviadas).toBe(2);
        const destinos = (emailSender.send as jest.Mock).mock.calls.map((c) => c[0].to);
        expect(destinos).toEqual(["u1@example.com", "u2@example.com"]);
    });

    it("el correo identifica la película y trae el enlace para reseñar", async () => {
        const { service, emailSender } = setup([candidata(1, "2026-10-19", "23:00")]);
        await service.enviarSolicitudesResena(AHORA);

        const m = (emailSender.send as jest.Mock).mock.calls[0][0];
        expect(m.subject).toContain("Coco");
        expect(m.html).toContain("resena=1");
    });

    it("marca la notificación como enviada", async () => {
        const { service, repo } = setup([candidata(1, "2026-10-19", "23:00")]);
        await service.enviarSolicitudesResena(AHORA);
        expect(repo.marcarEnviada).toHaveBeenCalledWith(10);
    });

    it("no reenvía si la invitación ya figura como enviada", async () => {
        const { service, emailSender } = setup([candidata(1, "2026-10-19", "23:00")], {
            obtenerOCrearSolicitudResena: jest.fn(async () => ({ id: 10, estado: "enviado" })),
        });
        expect(await service.enviarSolicitudesResena(AHORA)).toBe(0);
        expect(emailSender.send).not.toHaveBeenCalled();
    });

    it("consulta solo funciones dentro de la ventana de días configurada", async () => {
        const { service, repo } = setup([]);
        await service.enviarSolicitudesResena(AHORA);

        const desde = (repo.getCandidatasSolicitudResena as jest.Mock).mock.calls[0][0] as Date;
        const esperado = new Date(AHORA.getTime() - VENTANA_SOLICITUD_RESENA_DIAS * 86_400_000);
        expect(desde.toISOString().slice(0, 10)).toBe(esperado.toISOString().slice(0, 10));
    });

    it("si un envío falla lo marca fallido, sigue con las demás y NO lanza", async () => {
        const send = jest
            .fn()
            .mockRejectedValueOnce(new Error("535 credenciales inválidas"))
            .mockResolvedValueOnce(undefined);
        const { service, repo } = setup(
            [candidata(1, "2026-10-19", "23:00"), candidata(2, "2026-10-19", "22:00")],
            {},
            { send }
        );

        await expect(service.enviarSolicitudesResena(AHORA)).resolves.toBe(1);
        expect(repo.marcarFallida).toHaveBeenCalledWith(10);
        expect(repo.marcarEnviada).toHaveBeenCalledWith(20);
    });

    it("si la consulta a la BD falla no lanza y devuelve 0", async () => {
        const { service } = setup([], {
            getCandidatasSolicitudResena: jest.fn(async () => {
                throw new Error("db caída");
            }),
        });
        await expect(service.enviarSolicitudesResena(AHORA)).resolves.toBe(0);
    });
});
