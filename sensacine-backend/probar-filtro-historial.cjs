const { PrismaClient, EstadoReserva } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const hoy = new Date();
    const inicioHoy = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
    );

    console.log("Inicio de hoy:", inicioHoy.toISOString());

    const pruebas = [
        {
            nombre: "Solo usuario",
            where: { idUsuario: 10 }
        },
        {
            nombre: "Usuario y estado",
            where: {
                idUsuario: 10,
                estado: { not: EstadoReserva.Cancelado }
            }
        },
        {
            nombre: "Usuario y fecha pasada",
            where: {
                idUsuario: 10,
                funcion: {
                    fecha: { lt: inicioHoy }
                }
            }
        },
        {
            nombre: "Todos los filtros del historial",
            where: {
                idUsuario: 10,
                estado: { not: EstadoReserva.Cancelado },
                funcion: {
                    fecha: { lt: inicioHoy }
                }
            }
        }
    ];

    for (const prueba of pruebas) {
        const resultados = await prisma.reserva.findMany({
            where: prueba.where,
            select: { id: true, idUsuario: true, idFuncion: true, estado: true }
        });

        console.log("\n" + prueba.nombre + ":", JSON.stringify(resultados));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
