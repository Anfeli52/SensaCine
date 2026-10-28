import { EstadoReserva, TipoNotificacion } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../infrastructure/prisma/client";
import { DatosConfirmacionReserva, DatosSolicitudResena, INotificacionRepository } from "./notificacion.types";

export class PrismaNotificacionRepository implements INotificacionRepository {
    // Normalmente la fila ya la creó la transacción de la reserva; se crea aquí para reservas anteriores a esta función
    async obtenerOCrearConfirmacion(idReserva: number) {
        const existente = await prisma.notificacion.findFirst({
            where: { idReserva, tipo: TipoNotificacion.confirmacion },
            select: { id: true, estado: true },
        });
        if (existente) return existente;
        return prisma.notificacion.create({
            data: { idReserva, tipo: TipoNotificacion.confirmacion },
            select: { id: true, estado: true },
        });
    }

    async getDatosConfirmacion(idReserva: number): Promise<DatosConfirmacionReserva | null> {
        const reserva = await prisma.reserva.findUnique({
            where: { id: idReserva },
            include: {
                usuario: { select: { email: true, nombre: true } },
                funcion: { include: { pelicula: { select: { titulo: true } }, sala: { select: { nombre: true } } } },
                asientos: { include: { asiento: { select: { fila: true, numero: true } } } },
                pagos: { orderBy: { id: "desc" }, take: 1 },
            },
        });
        if (!reserva) return null;

        return {
            idReserva: reserva.id,
            emailDestino: reserva.usuario.email,
            nombreUsuario: reserva.usuario.nombre,
            pelicula: reserva.funcion.pelicula.titulo,
            sala: reserva.funcion.sala.nombre,
            fecha: reserva.funcion.fecha,
            horaInicio: reserva.funcion.horaInicio,
            horaFin: reserva.funcion.horaFin,
            asientos: reserva.asientos.map((a) => ({
                fila: a.asiento.fila,
                numero: a.asiento.numero,
                nombrePersona: a.nombrePersona,
            })),
            montoPagado: Number(reserva.montoTotal),
            referenciaTransaccion: reserva.pagos[0]?.referenciaTransaccion ?? null,
        };
    }

    async marcarEnviada(idNotificacion: number) {
        await prisma.notificacion.update({
            where: { id: idNotificacion },
            data: { estado: "enviado", fechaEnvio: new Date() },
        });
    }

    async marcarFallida(idNotificacion: number) {
        await prisma.notificacion.update({ where: { id: idNotificacion }, data: { estado: "fallido" } });
    }

    async getCandidatasSolicitudResena(desde: Date) {
        const reservas = await prisma.reserva.findMany({
            where: {
                // Confirmada = pagada y no cancelada. Es lo más cercano a "asistió" que registra el sistema
                estado: EstadoReserva.Confirmado,
                funcion: { fecha: { gte: desde } },
                notificaciones: { none: { tipo: TipoNotificacion.solicitud_resena } },
                resenas: { none: {} },
            },
            select: { id: true, funcion: { select: { fecha: true, horaFin: true } } },
        });
        return reservas.map((r) => ({ idReserva: r.id, fecha: r.funcion.fecha, horaFin: r.funcion.horaFin }));
    }

    async obtenerOCrearSolicitudResena(idReserva: number) {
        const existente = await prisma.notificacion.findFirst({
            where: { idReserva, tipo: TipoNotificacion.solicitud_resena },
            select: { id: true, estado: true },
        });
        if (existente) return existente;
        return prisma.notificacion.create({
            data: { idReserva, tipo: TipoNotificacion.solicitud_resena },
            select: { id: true, estado: true },
        });
    }

    async getDatosSolicitudResena(idReserva: number): Promise<DatosSolicitudResena | null> {
        const reserva = await prisma.reserva.findUnique({
            where: { id: idReserva },
            include: {
                usuario: { select: { email: true, nombre: true } },
                funcion: { include: { pelicula: { select: { titulo: true } } } },
            },
        });
        if (!reserva) return null;

        const base = env.FRONTEND_URL.replace(/\/+$/, "");
        return {
            idReserva: reserva.id,
            emailDestino: reserva.usuario.email,
            nombreUsuario: reserva.usuario.nombre,
            pelicula: reserva.funcion.pelicula.titulo,
            fecha: reserva.funcion.fecha,
            urlResena: `${base}/reservas/historial?resena=${reserva.id}`,
        };
    }
}
