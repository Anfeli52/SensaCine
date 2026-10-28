import { logger } from "../../infrastructure/logger/winston";
import { getCinemaDateStr, getCinemaTimeStr } from "../../common/helpers/dateUtils";
import { renderConfirmacionReserva } from "./confirmacionReserva.template";
import { renderSolicitudResena } from "./solicitudResena.template";
import {
    IConfirmacionReservaNotifier,
    IEmailSender,
    INotificacionRepository,
    ISolicitudResenaNotifier,
} from "./notificacion.types";

// Solo se invita a reseñar funciones recientes: al activar la función por primera vez
// no se bombardea a los usuarios con invitaciones de reservas antiguas.
export const VENTANA_SOLICITUD_RESENA_DIAS = 7;

export class NotificacionService implements IConfirmacionReservaNotifier, ISolicitudResenaNotifier {
    constructor(
        private repo: INotificacionRepository,
        private emailSender: IEmailSender
    ) {}

    /**
     * Envía el correo de confirmación y deja constancia en la tabla `notificacion`.
     * NUNCA lanza: el pago y la reserva ya están hechos, un fallo de correo no debe afectarlos.
     */
    async enviarConfirmacionReserva(idReserva: number): Promise<void> {
        let idNotificacion: number | undefined;
        try {
            const notificacion = await this.repo.obtenerOCrearConfirmacion(idReserva);
            idNotificacion = notificacion.id;
            if (notificacion.estado === "enviado") return; // idempotente: no se duplica el correo

            const datos = await this.repo.getDatosConfirmacion(idReserva);
            if (!datos) throw new Error("reserva no encontrada");
            if (!datos.emailDestino) throw new Error("el usuario no tiene correo registrado");

            await this.emailSender.send(renderConfirmacionReserva(datos));
            await this.repo.marcarEnviada(notificacion.id);
        } catch (e) {
            logger.error(`No se pudo enviar la confirmación de la reserva #${idReserva}: ${e instanceof Error ? e.message : e}`);
            if (idNotificacion) await this.repo.marcarFallida(idNotificacion).catch(() => undefined);
        }
    }

    /**
     * Invita a reseñar cada reserva Confirmada cuya función ya terminó, una sola vez por reserva.
     * Solo se invita a quien tiene una reserva confirmada de ESA función, nunca a otros usuarios.
     * NUNCA lanza; devuelve cuántas invitaciones se enviaron.
     */
    async enviarSolicitudesResena(ahora: Date = new Date()): Promise<number> {
        let enviadas = 0;
        try {
            const desde = new Date(ahora.getTime() - VENTANA_SOLICITUD_RESENA_DIAS * 24 * 60 * 60 * 1000);
            const candidatas = await this.repo.getCandidatasSolicitudResena(
                new Date(`${getCinemaDateStr(desde)}T00:00:00.000Z`)
            );
            const hoy = getCinemaDateStr(ahora);
            const horaActual = getCinemaTimeStr(ahora);

            for (const c of candidatas) {
                const fecha = c.fecha.toISOString().slice(0, 10);
                const horaFin = c.horaFin.toISOString().slice(11, 16);
                const terminada = fecha < hoy || (fecha === hoy && horaFin < horaActual);
                if (!terminada) continue;

                if (await this.enviarSolicitudResena(c.idReserva)) enviadas++;
            }
        } catch (e) {
            logger.error(`No se pudieron procesar las invitaciones a reseñar: ${e instanceof Error ? e.message : e}`);
        }
        return enviadas;
    }

    private async enviarSolicitudResena(idReserva: number): Promise<boolean> {
        let idNotificacion: number | undefined;
        try {
            const notificacion = await this.repo.obtenerOCrearSolicitudResena(idReserva);
            idNotificacion = notificacion.id;
            if (notificacion.estado === "enviado") return false;

            const datos = await this.repo.getDatosSolicitudResena(idReserva);
            if (!datos) throw new Error("reserva no encontrada");
            if (!datos.emailDestino) throw new Error("el usuario no tiene correo registrado");

            await this.emailSender.send(renderSolicitudResena(datos));
            await this.repo.marcarEnviada(notificacion.id);
            return true;
        } catch (e) {
            logger.error(`No se pudo enviar la invitación a reseñar de la reserva #${idReserva}: ${e instanceof Error ? e.message : e}`);
            if (idNotificacion) await this.repo.marcarFallida(idNotificacion).catch(() => undefined);
            return false;
        }
    }
}
