import { EstadoReserva, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";
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
}
