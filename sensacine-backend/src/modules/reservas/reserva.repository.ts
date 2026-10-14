import { EstadoOrdenCocina, EstadoReserva, TipoNotificacion, TipoRestriccion } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";
import {
    CrearReservaPersistir,
    IReservaRepository,
    ReservaConflictoError,
    ReservaPersistida,
} from "./reserva.types";

const NOMBRE_OTRA_RESTRICCION = "Otra restricción";

export class PrismaReservaRepository implements IReservaRepository {
    getFuncion(idFuncion: number) {
        return prisma.funcion.findUnique({
            where: { id: idFuncion },
            select: { id: true, idSala: true, fecha: true, horaFin: true, estado: true, precioAsientoOficial: true },
        });
    }

    getAsientosByIds(idsAsiento: number[]) {
        return prisma.asiento.findMany({ where: { id: { in: idsAsiento } } });
    }

    getRestriccionesPorNombre(nombres: string[]) {
        return prisma.restriccionAlimentaria.findMany({
            where: { OR: nombres.map((nombre) => ({ nombre: { equals: nombre, mode: "insensitive" as const } })) },
            select: { id: true, nombre: true },
        });
    }

    // Catálogo para texto libre del comensal ("Otro"): el detalle va en `notas` de reserva_restriccion
    async getOrCreateRestriccionOtra() {
        const existente = await prisma.restriccionAlimentaria.findFirst({
            where: { nombre: NOMBRE_OTRA_RESTRICCION },
            select: { id: true },
        });
        if (existente) return existente;
        return prisma.restriccionAlimentaria.create({
            data: {
                nombre: NOMBRE_OTRA_RESTRICCION,
                tipo: TipoRestriccion.alergia,
                descripcion: "Restricción indicada manualmente por el comensal (ver notas)",
            },
            select: { id: true },
        });
    }

    getTarjeta(idTarjeta: number) {
        return prisma.tarjeta.findUnique({
            where: { id: idTarjeta },
            select: { id: true, idUsuario: true, tipo: true, estado: true, saldo: true },
        });
    }

    crearReservaConfirmada(input: CrearReservaPersistir): Promise<ReservaPersistida> {
        const { idUsuario, idFuncion, idTarjeta, monto, medioPago, comensales } = input;
        const idsAsiento = comensales.map((c) => c.idAsiento);

        return prisma.$transaction(async (tx) => {
            // 1. Serializa a quienes reservan esta misma función: lo que sigue es "comprobar y luego escribir"
            await tx.$queryRaw`SELECT id_funcion FROM funcion WHERE id_funcion = ${idFuncion} FOR NO KEY UPDATE`;

            // 2. El bloqueo debe seguir vigente y ser exactamente de estos asientos (lo decide el reloj del servidor)
            const bloqueos = await tx.bloqueoAsiento.findMany({
                where: { idFuncion, idUsuario, expiraEn: { gt: new Date() } },
                select: { idAsiento: true },
            });
            const vigente =
                bloqueos.length === idsAsiento.length && idsAsiento.every((id) => bloqueos.some((b) => b.idAsiento === id));
            if (!vigente) throw new ReservaConflictoError("bloqueo_vencido");

            // 3. Defensa final: ninguno de los asientos puede estar ya reservado en esta función
            const yaReservados = await tx.reservaAsiento.count({
                where: { idAsiento: { in: idsAsiento }, reserva: { idFuncion, estado: { not: EstadoReserva.Cancelado } } },
            });
            if (yaReservados > 0) throw new ReservaConflictoError("asiento_reservado");

            // 4. Cobro atómico: solo descuenta si la tarjeta es del usuario, está activa y alcanza el saldo
            const cobro = await tx.tarjeta.updateMany({
                where: { id: idTarjeta, idUsuario, estado: "activa", saldo: { gte: monto } },
                data: { saldo: { decrement: monto } },
            });
            if (cobro.count !== 1) throw new ReservaConflictoError("saldo_insuficiente");
            const { saldo } = await tx.tarjeta.findUniqueOrThrow({ where: { id: idTarjeta }, select: { saldo: true } });

            // 5. Reserva con sus comensales, restricciones y órdenes de cocina
            const reserva = await tx.reserva.create({
                data: { idUsuario, idFuncion, montoTotal: monto, estado: EstadoReserva.Confirmado },
            });
            for (const comensal of comensales) {
                const reservaAsiento = await tx.reservaAsiento.create({
                    data: { idReserva: reserva.id, idAsiento: comensal.idAsiento, nombrePersona: comensal.nombrePersona },
                });
                if (comensal.restricciones.length) {
                    await tx.reservaRestriccion.createMany({
                        data: comensal.restricciones.map((r) => ({
                            idReservaAsiento: reservaAsiento.id,
                            idRestriccion: r.idRestriccion,
                            notas: r.notas ?? null,
                        })),
                    });
                }
                await tx.ordenCocina.create({
                    data: { idReservaAsiento: reservaAsiento.id, estado: EstadoOrdenCocina.Pendiente },
                });
            }

            // 6. Pago aprobado
            const pago = await tx.pago.create({
                data: {
                    idReserva: reserva.id,
                    medioPago,
                    monto,
                    estado: "aprobado",
                    referenciaTransaccion: `TX-SENSA-${Date.now()}-${reserva.id}`,
                },
            });

            // 7. Deja registrada la notificación de confirmación (se envía después de confirmar la transacción)
            await tx.notificacion.create({ data: { idReserva: reserva.id, tipo: TipoNotificacion.confirmacion } });

            // 8. El bloqueo cumplió su función: los asientos pasan de "pendiente" a reservados
            await tx.bloqueoAsiento.deleteMany({ where: { idFuncion, idUsuario } });

            return {
                idReserva: reserva.id,
                fechaReserva: reserva.fechaReserva,
                referenciaTransaccion: pago.referenciaTransaccion as string,
                fechaPago: pago.fechaPago,
                nuevoSaldo: Number(saldo),
            };
        });
    }
}
