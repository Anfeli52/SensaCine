import { EstadoReserva, Prisma } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { getCinemaDateStr, getCinemaTimeStr } from "../../common/helpers/dateUtils";
import { CrearResenaInput, IRegistroResenaRepository, ResenaGuardada } from "./registroResena.types";

export const MENSAJE_RESENA_GUARDADA = "¡Gracias! Tu reseña fue guardada correctamente.";

export class RegistroResenaService {
    constructor(private readonly repo: IRegistroResenaRepository) {}

    /**
     * Registra la reseña de una reserva del usuario. Reglas:
     * - la reserva debe ser suya y no estar cancelada,
     * - la función ya debe haber terminado (solo reseña quien pudo asistir),
     * - una sola reseña por reserva.
     */
    async crearResena(
        idUsuario: number,
        data: CrearResenaInput,
        ahora: Date = new Date()
    ): Promise<{ mensaje: string; resena: ResenaGuardada }> {
        const reserva = await this.repo.getReservaDelUsuario(data.idReserva, idUsuario);
        if (!reserva) throw new AppError("Reserva no encontrada", 404);

        if (reserva.estado === EstadoReserva.Cancelado) {
            throw new AppError("No puedes reseñar una reserva cancelada", 400);
        }

        const fecha = reserva.fecha.toISOString().slice(0, 10);
        const horaFin = reserva.horaFin.toISOString().slice(11, 16);
        const hoy = getCinemaDateStr(ahora);
        const terminada = fecha < hoy || (fecha === hoy && horaFin < getCinemaTimeStr(ahora));
        if (!terminada) {
            throw new AppError("Podrás reseñar la función cuando haya terminado", 400);
        }

        if (await this.repo.getResenaByReserva(data.idReserva)) {
            throw new AppError("Ya registraste una reseña para esta reserva", 409);
        }

        try {
            const resena = await this.repo.crear(data);
            return { mensaje: MENSAJE_RESENA_GUARDADA, resena };
        } catch (e) {
            // Doble envío simultáneo: la restricción única de BD es la última barrera
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                throw new AppError("Ya registraste una reseña para esta reserva", 409);
            }
            throw e;
        }
    }
}
