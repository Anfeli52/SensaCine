import { logger } from "../../infrastructure/logger/winston";
import { renderConfirmacionReserva } from "./confirmacionReserva.template";
import { IConfirmacionReservaNotifier, IEmailSender, INotificacionRepository } from "./notificacion.types";

export class NotificacionService implements IConfirmacionReservaNotifier {
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
}
