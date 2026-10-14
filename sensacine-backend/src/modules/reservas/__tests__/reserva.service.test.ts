import { ReservaService } from "../reserva.service";
import { AppError } from "../../../common/errors/AppError";
import {
    CrearReservaInput,
    IBloqueoVerificador,
    IReservaNotifier,
    IReservaRepository,
    ReservaConflictoError,
} from "../reserva.types";

const UN_ANIO_ADELANTE = new Date(Date.UTC(new Date().getUTCFullYear() + 1, 5, 1));
const FECHA_PASADA = new Date(Date.UTC(2020, 0, 1));

function makeFakeRepo(overrides: Partial<IReservaRepository> = {}): IReservaRepository {
    return {
        getFuncion: jest.fn(async () => ({
            id: 10,
            idSala: 1,
            fecha: UN_ANIO_ADELANTE,
            horaFin: new Date("1970-01-01T22:00:00Z"),
            estado: "programada",
            precioAsientoOficial: "32000",
        })),
        getAsientosByIds: jest.fn(async (ids: number[]) => ids.map((id) => ({ id, idSala: 1, fila: "A", numero: id }))),
        getRestriccionesPorNombre: jest.fn(async (nombres: string[]) =>
            nombres.map((nombre, i) => ({ id: 100 + i, nombre: nombre[0].toUpperCase() + nombre.slice(1) }))
        ),
        getOrCreateRestriccionOtra: jest.fn(async () => ({ id: 999 })),
        getTarjeta: jest.fn(async () => ({ id: 5, idUsuario: 7, tipo: "Crédito", estado: "activa", saldo: "500000" })),
        crearReservaConfirmada: jest.fn(async () => ({
            idReserva: 77,
            fechaReserva: new Date("2026-10-14T00:00:00Z"),
            referenciaTransaccion: "TX-SENSA-1-77",
            fechaPago: new Date("2026-10-14T00:00:01Z"),
            nuevoSaldo: 436000,
        })),
        ...overrides,
    };
}

function setup(repoOverrides: Partial<IReservaRepository> = {}, verificador?: IBloqueoVerificador) {
    const repo = makeFakeRepo(repoOverrides);
    const bloqueos: IBloqueoVerificador = verificador ?? { verificarBloqueoVigente: jest.fn(async () => undefined) };
    const notifier: IReservaNotifier = { asientosOcupados: jest.fn() };
    return { repo, bloqueos, notifier, service: new ReservaService(repo, bloqueos, notifier) };
}

const input: CrearReservaInput = {
    idFuncion: 10,
    idTarjeta: 5,
    comensales: [
        { idAsiento: 1, nombrePersona: "Ana", restricciones: ["maní", "Gluten"] },
        { idAsiento: 2, nombrePersona: "Luis", restricciones: [], otraRestriccion: "Kiwi" },
    ],
};

describe("ReservaService.crear", () => {
    it("crea la reserva con el monto calculado por el servidor y notifica los asientos ocupados", async () => {
        const { service, repo, notifier } = setup();

        const res = await service.crear(7, input);

        expect(res.idReserva).toBe(77);
        expect(res.montoTotal).toBe(64000); // 2 asientos x 32.000
        expect(res.pago).toMatchObject({ montoPagado: 64000, nuevoSaldo: 436000, tarjetaId: 5 });
        expect(res.asientos).toEqual([
            { idAsiento: 1, fila: "A", numero: 1, nombrePersona: "Ana" },
            { idAsiento: 2, fila: "A", numero: 2, nombrePersona: "Luis" },
        ]);
        expect(repo.crearReservaConfirmada).toHaveBeenCalledWith(
            expect.objectContaining({ idUsuario: 7, idFuncion: 10, monto: 64000, medioPago: "tarjeta_credito" })
        );
        expect(notifier.asientosOcupados).toHaveBeenCalledWith(10, [1, 2]);
    });

    it("guarda las restricciones del catálogo y el texto libre como 'Otra restricción' con notas", async () => {
        const { service, repo } = setup();
        await service.crear(7, input);

        const { comensales } = (repo.crearReservaConfirmada as jest.Mock).mock.calls[0][0];
        expect(comensales[0].restricciones).toHaveLength(2);
        expect(comensales[1].restricciones).toEqual([{ idRestriccion: 999, notas: "Kiwi" }]);
    });

    it("usa tarjeta_debito cuando la tarjeta es de débito", async () => {
        const { service, repo } = setup({
            getTarjeta: jest.fn(async () => ({ id: 5, idUsuario: 7, tipo: "Débito", estado: "activa", saldo: "500000" })),
        });
        await service.crear(7, input);
        expect(repo.crearReservaConfirmada).toHaveBeenCalledWith(expect.objectContaining({ medioPago: "tarjeta_debito" }));
    });

    it("rechaza asientos repetidos", async () => {
        const { service } = setup();
        const dup = { ...input, comensales: [input.comensales[0], { ...input.comensales[1], idAsiento: 1 }] };
        await expect(service.crear(7, dup)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("404 si la función no existe", async () => {
        const { service } = setup({ getFuncion: jest.fn(async () => null) });
        await expect(service.crear(7, input)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("409 si la función ya finalizó o no está programada", async () => {
        const finalizada = setup({
            getFuncion: jest.fn(async () => ({
                id: 10, idSala: 1, fecha: FECHA_PASADA, horaFin: new Date("1970-01-01T22:00:00Z"),
                estado: "programada", precioAsientoOficial: "32000",
            })),
        });
        await expect(finalizada.service.crear(7, input)).rejects.toMatchObject({ statusCode: 409 });

        const cancelada = setup({
            getFuncion: jest.fn(async () => ({
                id: 10, idSala: 1, fecha: UN_ANIO_ADELANTE, horaFin: new Date("1970-01-01T22:00:00Z"),
                estado: "cancelada", precioAsientoOficial: "32000",
            })),
        });
        await expect(cancelada.service.crear(7, input)).rejects.toMatchObject({ statusCode: 409 });
    });

    it("400 si un asiento es de otra sala", async () => {
        const { service } = setup({
            getAsientosByIds: jest.fn(async (ids: number[]) => ids.map((id) => ({ id, idSala: 2, fila: "A", numero: id }))),
        });
        await expect(service.crear(7, input)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("no cobra ni escribe nada si el bloqueo ya venció", async () => {
        const verificador: IBloqueoVerificador = {
            verificarBloqueoVigente: jest.fn(async () => {
                throw new AppError("El tiempo para completar la reserva expiró.", 409);
            }),
        };
        const { service, repo, notifier } = setup({}, verificador);

        await expect(service.crear(7, input)).rejects.toMatchObject({ statusCode: 409 });
        expect(repo.crearReservaConfirmada).not.toHaveBeenCalled();
        expect(notifier.asientosOcupados).not.toHaveBeenCalled();
    });

    it("400 ante una restricción que no existe en el catálogo", async () => {
        const { service, repo } = setup({ getRestriccionesPorNombre: jest.fn(async () => []) });
        await expect(service.crear(7, input)).rejects.toThrow(/no reconocida/);
        expect(repo.crearReservaConfirmada).not.toHaveBeenCalled();
    });

    it("404 si la tarjeta es de otro usuario o está inactiva", async () => {
        const ajena = setup({ getTarjeta: jest.fn(async () => ({ id: 5, idUsuario: 99, tipo: "Crédito", estado: "activa", saldo: "500000" })) });
        await expect(ajena.service.crear(7, input)).rejects.toMatchObject({ statusCode: 404 });

        const inactiva = setup({ getTarjeta: jest.fn(async () => ({ id: 5, idUsuario: 7, tipo: "Crédito", estado: "inactiva", saldo: "500000" })) });
        await expect(inactiva.service.crear(7, input)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("400 con saldo insuficiente y sin tocar la BD", async () => {
        const { service, repo } = setup({
            getTarjeta: jest.fn(async () => ({ id: 5, idUsuario: 7, tipo: "Crédito", estado: "activa", saldo: "10000" })),
        });
        await expect(service.crear(7, input)).rejects.toMatchObject({ statusCode: 400 });
        expect(repo.crearReservaConfirmada).not.toHaveBeenCalled();
    });

    it.each([
        ["bloqueo_vencido", /tiempo/],
        ["asiento_reservado", /ya fue reservado/],
        ["saldo_insuficiente", /Saldo insuficiente/],
    ] as const)("traduce el conflicto '%s' de la transacción a 409 y no notifica", async (motivo, mensaje) => {
        const { service, notifier } = setup({
            crearReservaConfirmada: jest.fn(async () => {
                throw new ReservaConflictoError(motivo);
            }),
        });
        await expect(service.crear(7, input)).rejects.toMatchObject({ statusCode: 409, message: expect.stringMatching(mensaje) });
        expect(notifier.asientosOcupados).not.toHaveBeenCalled();
    });

    it("no notifica si la transacción falla por un error inesperado", async () => {
        const { service, notifier } = setup({
            crearReservaConfirmada: jest.fn(async () => {
                throw new Error("db caída");
            }),
        });
        await expect(service.crear(7, input)).rejects.toThrow("db caída");
        expect(notifier.asientosOcupados).not.toHaveBeenCalled();
    });
});
