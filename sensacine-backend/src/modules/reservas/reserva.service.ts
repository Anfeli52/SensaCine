import { AppError } from "../../common/errors/AppError";
import { getCinemaDateStr, getCinemaTimeStr } from "../../common/helpers/dateUtils";
import { ReservaCreadaDTO } from "./dtos/ReservaCreadaDTO";
import {
    ComensalPersistir,
    CrearReservaInput,
    FuncionParaReserva,
    IBloqueoVerificador,
    IReservaNotifier,
    IReservaRepository,
    ReservaConflictoError,
} from "./reserva.types";

const MENSAJE_BLOQUEO_VENCIDO = "El tiempo para completar la reserva expiró. Selecciona los asientos de nuevo.";

export class ReservaService {
    constructor(
        private repo: IReservaRepository,
        private bloqueos: IBloqueoVerificador,
        private notifier: IReservaNotifier
    ) {}

    async crear(idUsuario: number, input: CrearReservaInput): Promise<ReservaCreadaDTO> {
        const { idFuncion, idTarjeta, comensales } = input;
        const idsAsiento = comensales.map((c) => c.idAsiento);
        if (new Set(idsAsiento).size !== idsAsiento.length) throw new AppError("Hay asientos repetidos en la reserva", 400);

        const funcion = await this.repo.getFuncion(idFuncion);
        if (!funcion) throw new AppError("Función no encontrada", 404);
        if (funcion.estado !== "programada" || this.haFinalizado(funcion)) {
            throw new AppError("La función ya no está disponible para reservar", 409);
        }

        const asientos = await this.repo.getAsientosByIds(idsAsiento);
        if (asientos.length !== idsAsiento.length || asientos.some((a) => a.idSala !== funcion.idSala)) {
            throw new AppError("Alguno de los asientos no pertenece a la sala de esta función", 400);
        }

        // Falla rápido (sin trabajo ni transacción) si el tiempo ya venció; la transacción lo vuelve a comprobar
        await this.bloqueos.verificarBloqueoVigente(idFuncion, idUsuario, idsAsiento);

        const comensalesPersistir = await this.resolverRestricciones(comensales);

        // El monto lo calcula el servidor: el cliente no lo envía y no puede alterarlo
        const monto = idsAsiento.length * Number(funcion.precioAsientoOficial);

        const tarjeta = await this.repo.getTarjeta(idTarjeta);
        if (!tarjeta || tarjeta.idUsuario !== idUsuario || tarjeta.estado.toLowerCase() !== "activa") {
            throw new AppError("Tarjeta no encontrada o no autorizada", 404);
        }
        const saldo = Number(tarjeta.saldo);
        if (saldo < monto) {
            throw new AppError(
                `Saldo insuficiente en la tarjeta seleccionada. Saldo disponible: $${saldo.toLocaleString("es-CO")}, Requerido: $${monto.toLocaleString("es-CO")}`,
                400
            );
        }

        let persistida;
        try {
            persistida = await this.repo.crearReservaConfirmada({
                idUsuario,
                idFuncion,
                idTarjeta,
                monto,
                medioPago: tarjeta.tipo.toLowerCase().startsWith("d") ? "tarjeta_debito" : "tarjeta_credito",
                comensales: comensalesPersistir,
            });
        } catch (e) {
            if (e instanceof ReservaConflictoError) throw this.aAppError(e);
            throw e;
        }

        // Se notifica DESPUÉS de confirmar en BD: los demás ven estos asientos como ocupados al instante
        this.notifier.asientosOcupados(idFuncion, idsAsiento);

        return {
            idReserva: persistida.idReserva,
            idFuncion,
            estado: "Confirmado",
            montoTotal: monto,
            fechaReserva: persistida.fechaReserva.toISOString(),
            asientos: comensales.map((c) => {
                const a = asientos.find((x) => x.id === c.idAsiento)!;
                return { idAsiento: a.id, fila: a.fila, numero: a.numero, nombrePersona: c.nombrePersona };
            }),
            pago: {
                referenciaTransaccion: persistida.referenciaTransaccion,
                montoPagado: monto,
                nuevoSaldo: persistida.nuevoSaldo,
                tarjetaId: idTarjeta,
                fechaPago: persistida.fechaPago.toISOString(),
            },
        };
    }

    // Nombres de restricción -> ids del catálogo. El texto libre ("Otro") se guarda en `notas`.
    private async resolverRestricciones(comensales: CrearReservaInput["comensales"]): Promise<ComensalPersistir[]> {
        const nombres = Array.from(new Set(comensales.flatMap((c) => c.restricciones.map((r) => r.toLowerCase()))));
        const catalogo = nombres.length ? await this.repo.getRestriccionesPorNombre(nombres) : [];
        const idPorNombre = new Map(catalogo.map((r) => [r.nombre.toLowerCase(), r.id]));

        const desconocidas = nombres.filter((n) => !idPorNombre.has(n));
        if (desconocidas.length) throw new AppError(`Restricción alimentaria no reconocida: ${desconocidas.join(", ")}`, 400);

        const hayOtra = comensales.some((c) => c.otraRestriccion);
        const idOtra = hayOtra ? (await this.repo.getOrCreateRestriccionOtra()).id : undefined;

        return comensales.map((c) => {
            const idsUnicos = Array.from(new Set(c.restricciones.map((r) => idPorNombre.get(r.toLowerCase())!)));
            const restricciones: ComensalPersistir["restricciones"] = idsUnicos.map((idRestriccion) => ({ idRestriccion }));
            if (c.otraRestriccion && idOtra) restricciones.push({ idRestriccion: idOtra, notas: c.otraRestriccion });
            return { idAsiento: c.idAsiento, nombrePersona: c.nombrePersona, restricciones };
        });
    }

    // Misma regla que la cartelera: una función de hoy sigue vigente hasta que termina
    private haFinalizado(funcion: FuncionParaReserva): boolean {
        const fecha = funcion.fecha.toISOString().slice(0, 10);
        const horaFin = funcion.horaFin.toISOString().slice(11, 16);
        const hoy = getCinemaDateStr();
        return fecha < hoy || (fecha === hoy && horaFin < getCinemaTimeStr());
    }

    private aAppError(e: ReservaConflictoError): AppError {
        switch (e.motivo) {
            case "bloqueo_vencido":
                return new AppError(MENSAJE_BLOQUEO_VENCIDO, 409);
            case "asiento_reservado":
                return new AppError("Alguno de los asientos ya fue reservado por otra persona", 409);
            case "saldo_insuficiente":
                return new AppError("Saldo insuficiente o tarjeta no disponible", 409);
        }
    }
}
