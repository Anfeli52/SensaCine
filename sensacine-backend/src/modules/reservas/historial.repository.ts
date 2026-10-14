import { EstadoOrdenCocina, EstadoReserva, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";
import { AppError } from "../../common/errors/AppError";
import { CrearReservaDTO } from "./reserva.validator";
import { 
    getCinemaDateStr, 
    getCinemaTimeStr, 
    getCinemaTodayUtcMidnight 
} from "../../common/helpers/dateUtils";


const historialInclude = {
    funcion: {
        include: {
            pelicula: {
                select: {
                    id: true,
                    titulo: true,
                    posterUrl: true,
                    productos: {
                        where: {
                            estado: "activo",
                        },
                        select: {
                            id: true,
                            nombre: true,
                            descripcion: true,
                            categoria: true,
                            ordenMenu: true,
                            imagenUrl: true,
                        },
                        orderBy: [
                            { ordenMenu: "asc" },
                            { nombre: "asc" },
                        ],
                    },
                },
            },
            sala: {
                select: {
                    id: true,
                    nombre: true,
                },
            },
        },
    },
    asientos: {
        include: {
            asiento: {
                select: {
                    id: true,
                    fila: true,
                    numero: true,
                },
            },
            restricciones: {
                include: {
                    restriccion: {
                        select: {
                            id: true,
                            nombre: true,
                            tipo: true,
                            descripcion: true,
                        },
                    },
                    producto: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                },
            },
        },
    },
} satisfies Prisma.ReservaInclude;


export type ReservaHistorial = Prisma.ReservaGetPayload<{ include: typeof historialInclude; }>;

export class HistorialReservaRepository {
    async getReservasActivasByUsuario(idUsuario: number) {
        const todayUtc = getCinemaTodayUtcMidnight();
        const currentTimeStr = getCinemaTimeStr();
        const todayStr = getCinemaDateStr();

        const reservas = await prisma.reserva.findMany({
            where: {
                idUsuario,
                estado: EstadoReserva.Confirmado,
                funcion: {
                    fecha: { gte: todayUtc },
                },
            },
            include: historialInclude,
            orderBy: [
                { funcion: { fecha: "asc" } },
                { funcion: { horaInicio: "asc" } },
            ],
        });

        return reservas.filter((reserva) => {
            const f = reserva.funcion;
            const fDateStr = f.fecha.toISOString().split("T")[0];
            if (fDateStr > todayStr) return true;
            if (fDateStr === todayStr) {
                const horaFinStr = f.horaFin.toISOString().slice(11, 16);
                const horaInicioStr = f.horaInicio.toISOString().slice(11, 16);
                return horaFinStr >= currentTimeStr || horaInicioStr >= currentTimeStr;
            }
            return false;
        });
    }

    async getHistorialByUsuario(idUsuario: number) {
        const todayUtc = getCinemaTodayUtcMidnight();
        const todayStr = getCinemaDateStr();
        const currentTimeStr = getCinemaTimeStr();

        const reservas = await prisma.reserva.findMany({
            where: {
                idUsuario,
                estado: { not: EstadoReserva.Cancelado },
                funcion: {
                    fecha: { lte: todayUtc },
                },
            },
            include: historialInclude,
            orderBy: { fechaReserva: "desc" },
        });

        return reservas.filter((reserva) => {
            const f = reserva.funcion;
            const fDateStr = f.fecha.toISOString().split("T")[0];
            if (fDateStr < todayStr) return true;
            if (fDateStr === todayStr) {
                const horaFinStr = f.horaFin.toISOString().slice(11, 16);
                return horaFinStr < currentTimeStr;
            }
            return false;
        });
    }

    async getReservaById(idReserva: number, idUsuario: number) {
        return prisma.reserva.findFirst({
            where: {
                id: idReserva,
                idUsuario,
                estado: { not: EstadoReserva.Cancelado, },
            },
            include: historialInclude,
        });
    }

    async crearReserva(idUsuario: number, input: CrearReservaDTO) {
        const { idFuncion, montoTotal, medioPago, referenciaTransaccion, asientos } = input;

        const funcion = await prisma.funcion.findUnique({
            where: { id: idFuncion },
        });

        if (!funcion) {
            throw new AppError("La función seleccionada no existe", 404);
        }

        if (asientos.length === 0) {
            throw new AppError("Debe seleccionar al menos un asiento", 400);
        }

        const idsAsientos = asientos.map((a) => a.idAsiento);

        const ocupados = await prisma.reservaAsiento.findMany({
            where: {
                reserva: {
                    idFuncion,
                    estado: { not: EstadoReserva.Cancelado },
                },
                idAsiento: { in: idsAsientos },
            },
            select: { idAsiento: true },
        });

        if (ocupados.length > 0) {
            throw new AppError("Uno o más asientos seleccionados ya han sido reservados", 409);
        }

        const restriccionesCatalogo = await prisma.restriccionAlimentaria.findMany();

        const reservaCreada = await prisma.$transaction(async (tx) => {
            const nuevaReserva = await tx.reserva.create({
                data: {
                    idUsuario,
                    idFuncion,
                    montoTotal,
                    estado: EstadoReserva.Confirmado,
                },
            });

            for (const item of asientos) {
                const reservaAsiento = await tx.reservaAsiento.create({
                    data: {
                        idReserva: nuevaReserva.id,
                        idAsiento: item.idAsiento,
                        nombrePersona: item.nombrePersona || "Comensal",
                    },
                });

                await tx.ordenCocina.create({
                    data: {
                        idReservaAsiento: reservaAsiento.id,
                        estado: EstadoOrdenCocina.Pendiente,
                    },
                });

                if (item.alergias && item.alergias.length > 0) {
                    for (const alergiaNombre of item.alergias) {
                        const encontrada = restriccionesCatalogo.find(
                            (r) => r.nombre.toLowerCase() === alergiaNombre.trim().toLowerCase()
                        );

                        if (encontrada) {
                            await tx.reservaRestriccion.create({
                                data: {
                                    idReservaAsiento: reservaAsiento.id,
                                    idRestriccion: encontrada.id,
                                    notas: `Comensal ${item.nombrePersona || "Comensal"}: ${alergiaNombre}`,
                                },
                            });
                        }
                    }
                }
            }

            await tx.pago.create({
                data: {
                    idReserva: nuevaReserva.id,
                    medioPago: medioPago || "tarjeta_credito",
                    monto: montoTotal,
                    estado: "aprobado",
                    referenciaTransaccion: referenciaTransaccion || `TX-SENSA-${Date.now()}`,
                },
            });

            return tx.reserva.findUnique({
                where: { id: nuevaReserva.id },
                include: historialInclude,
            });
        });

        return reservaCreada!;
    }
}
