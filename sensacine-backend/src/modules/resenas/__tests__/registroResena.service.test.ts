import { EstadoReserva, Prisma } from "@prisma/client";
import { AppError } from "../../../common/errors/AppError";
import { MENSAJE_RESENA_GUARDADA, RegistroResenaService } from "../registroResena.service";
import { IRegistroResenaRepository, ReservaParaResena, ResenaGuardada } from "../registroResena.types";

const entrada = { idReserva: 5, calificacionPelicula: 4, calificacionExperiencia: 5, comentario: "Muy buena cena" };

// 2026-11-08 20:00 en Bogotá (UTC-5) = 2026-11-09 01:00 UTC
const AHORA = new Date("2026-11-09T01:00:00.000Z");

const reserva = (extra: Partial<ReservaParaResena> = {}): ReservaParaResena => ({
    id: 5,
    estado: EstadoReserva.Confirmado,
    fecha: new Date("2026-11-07T00:00:00.000Z"),
    horaFin: new Date("1970-01-01T21:00:00.000Z"),
    pelicula: "Dune",
    ...extra,
});

const guardada: ResenaGuardada = { id: 1, ...entrada, fechaCreacion: AHORA };

describe("RegistroResenaService (HU-19 / HU-20)", () => {
    let repo: jest.Mocked<IRegistroResenaRepository>;
    let service: RegistroResenaService;

    beforeEach(() => {
        repo = {
            getReservaDelUsuario: jest.fn().mockResolvedValue(reserva()),
            getResenaByReserva: jest.fn().mockResolvedValue(null),
            crear: jest.fn().mockResolvedValue(guardada),
        };
        service = new RegistroResenaService(repo);
    });

    describe("HU-19: Calificar una película", () => {
        it("asigna la calificación a la película y queda asociada a la función terminada recibiendo confirmación", async () => {
            const r = await service.crearResena(10, entrada, AHORA);

            expect(repo.getReservaDelUsuario).toHaveBeenCalledWith(5, 10);
            expect(repo.crear).toHaveBeenCalledWith(entrada);
            expect(r.mensaje).toBe(MENSAJE_RESENA_GUARDADA);
            expect(r.resena.calificacionPelicula).toBe(entrada.calificacionPelicula);
        });

        it("rechaza calificar la película si el usuario no ha asistido (función aún no termina)", async () => {
            repo.getReservaDelUsuario.mockResolvedValue(
                reserva({ fecha: new Date("2026-11-20T00:00:00.000Z") })
            );

            await expect(service.crearResena(10, entrada, AHORA)).rejects.toThrow(
                "cuando haya terminado"
            );
        });
    });

    it("guarda la reseña asociada a la reserva y devuelve la confirmación", async () => {
        const r = await service.crearResena(10, entrada, AHORA);

        expect(repo.getReservaDelUsuario).toHaveBeenCalledWith(5, 10);
        expect(repo.crear).toHaveBeenCalledWith(entrada);
        expect(r).toEqual({ mensaje: MENSAJE_RESENA_GUARDADA, resena: guardada });
    });

    it("rechaza con 404 una reserva inexistente o de otro usuario", async () => {
        repo.getReservaDelUsuario.mockResolvedValue(null);

        await expect(service.crearResena(10, entrada, AHORA)).rejects.toMatchObject({ statusCode: 404 });
        expect(repo.crear).not.toHaveBeenCalled();
    });

    it("rechaza una reserva cancelada", async () => {
        repo.getReservaDelUsuario.mockResolvedValue(reserva({ estado: EstadoReserva.Cancelado }));

        await expect(service.crearResena(10, entrada, AHORA)).rejects.toMatchObject({ statusCode: 400 });
        expect(repo.crear).not.toHaveBeenCalled();
    });

    it("rechaza si la función es futura", async () => {
        repo.getReservaDelUsuario.mockResolvedValue(reserva({ fecha: new Date("2026-11-20T00:00:00.000Z") }));

        await expect(service.crearResena(10, entrada, AHORA)).rejects.toThrow("cuando haya terminado");
    });

    it("rechaza si la función es hoy pero aún no termina", async () => {
        repo.getReservaDelUsuario.mockResolvedValue(
            reserva({ fecha: new Date("2026-11-08T00:00:00.000Z"), horaFin: new Date("1970-01-01T23:00:00.000Z") })
        );

        await expect(service.crearResena(10, entrada, AHORA)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("acepta si la función es hoy y ya terminó", async () => {
        repo.getReservaDelUsuario.mockResolvedValue(
            reserva({ fecha: new Date("2026-11-08T00:00:00.000Z"), horaFin: new Date("1970-01-01T18:00:00.000Z") })
        );

        await expect(service.crearResena(10, entrada, AHORA)).resolves.toBeDefined();
    });

    it("rechaza con 409 una segunda reseña de la misma reserva", async () => {
        repo.getResenaByReserva.mockResolvedValue(guardada);

        await expect(service.crearResena(10, entrada, AHORA)).rejects.toMatchObject({ statusCode: 409 });
        expect(repo.crear).not.toHaveBeenCalled();
    });

    it("traduce la violación de unicidad (doble envío simultáneo) a 409", async () => {
        repo.crear.mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "x" })
        );

        const p = service.crearResena(10, entrada, AHORA);
        await expect(p).rejects.toBeInstanceOf(AppError);
        await expect(p).rejects.toMatchObject({ statusCode: 409 });
    });

    it("propaga errores inesperados del repositorio", async () => {
        repo.crear.mockRejectedValue(new Error("db caída"));

        await expect(service.crearResena(10, entrada, AHORA)).rejects.toThrow("db caída");
    });
});
