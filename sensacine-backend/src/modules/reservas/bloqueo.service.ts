import { AppError } from "../../common/errors/AppError";
import { BloqueoResponseDTO } from "./dtos/BloqueoResponseDTO";
import { ConflictoBloqueoError, IBloqueoNotifier, IBloqueoRepository } from "./bloqueo.types";

export const DURACION_BLOQUEO_MS = 15 * 60 * 1000;

export class BloqueoService {
    constructor(
        private repo: IBloqueoRepository,
        private notifier: IBloqueoNotifier,
        private duracionMs: number = DURACION_BLOQUEO_MS
    ) {}

    async bloquear(idFuncion: number, idUsuario: number, idsAsiento: number[]): Promise<BloqueoResponseDTO> {
        const ids = Array.from(new Set(idsAsiento));

        const funcion = await this.repo.getFuncionSala(idFuncion);
        if (!funcion) throw new AppError("Función no encontrada", 404);

        const asientos = await this.repo.getAsientosByIds(ids);
        if (asientos.length !== ids.length || asientos.some((a) => a.idSala !== funcion.idSala)) {
            throw new AppError("Alguno de los asientos no pertenece a la sala de esta función", 400);
        }

        const reservados = await this.repo.getIdsAsientosReservados(idFuncion, ids);
        if (reservados.length) {
            throw new AppError(`Asientos ya reservados: ${this.etiquetas(asientos, reservados)}`, 409);
        }

        try {
            const { bloqueos, liberados } = await this.repo.reemplazarBloqueosUsuario({
                idFuncion,
                idUsuario,
                idsAsiento: ids,
                duracionMs: this.duracionMs,
            });

            // Se notifica DESPUÉS de confirmar en BD
            if (liberados.length) this.notifier.asientosLiberados(idFuncion, liberados);
            this.notifier.asientosPendientes(idFuncion, ids, idUsuario);

            return this.toDTO(idFuncion, ids, bloqueos[0].expiraEn);
        } catch (e) {
            if (e instanceof ConflictoBloqueoError) {
                throw new AppError(
                    `Asientos no disponibles (otro usuario los está reservando): ${this.etiquetas(asientos, e.idsAsiento)}`,
                    409
                );
            }
            throw e;
        }
    }

    // Estado real del bloqueo según el reloj del servidor. El contador del cliente solo lo muestra.
    async getMiBloqueo(idFuncion: number, idUsuario: number): Promise<BloqueoResponseDTO | null> {
        const bloqueos = await this.repo.getBloqueosUsuario(idFuncion, idUsuario);
        if (!bloqueos.length) return null;
        return this.toDTO(idFuncion, bloqueos.map((b) => b.idAsiento), bloqueos[0].expiraEn);
    }

    /**
     * Para el flujo de reserva/pago: falla si el usuario ya no retiene EXACTAMENTE esos asientos.
     * La validación vive aquí, no en el cliente, así que no se puede burlar alterando el contador.
     */
    async verificarBloqueoVigente(idFuncion: number, idUsuario: number, idsAsiento: number[]): Promise<void> {
        const vigentes = new Set((await this.repo.getBloqueosUsuario(idFuncion, idUsuario)).map((b) => b.idAsiento));
        const completo = idsAsiento.length > 0 && idsAsiento.length === vigentes.size && idsAsiento.every((id) => vigentes.has(id));
        if (!completo) throw new AppError("El tiempo para completar la reserva expiró. Selecciona los asientos de nuevo.", 409);
    }

    async liberar(idFuncion: number, idUsuario: number): Promise<void> {
        const liberados = await this.repo.liberarBloqueosUsuario(idFuncion, idUsuario);
        if (liberados.length) this.notifier.asientosLiberados(idFuncion, liberados);
    }

    // Lo invoca el barrendero periódico: libera los vencidos y avisa a los clientes conectados
    async liberarVencidos(): Promise<number> {
        const porFuncion = await this.repo.eliminarVencidos();
        let total = 0;
        for (const [idFuncion, ids] of porFuncion) {
            this.notifier.asientosLiberados(idFuncion, ids);
            total += ids.length;
        }
        return total;
    }

    private toDTO(idFuncion: number, idsAsiento: number[], expiraEn: Date): BloqueoResponseDTO {
        return {
            id_funcion: idFuncion,
            ids_asiento: idsAsiento,
            expira_en: expiraEn.toISOString(),
            segundos_restantes: Math.max(0, Math.floor((expiraEn.getTime() - Date.now()) / 1000)),
        };
    }

    private etiquetas(asientos: { id: number; fila: string; numero: number }[], ids: number[]) {
        return asientos
            .filter((a) => ids.includes(a.id))
            .map((a) => `${a.fila}${a.numero}`)
            .join(", ");
    }
}
