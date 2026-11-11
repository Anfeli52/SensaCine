import { ResenasService } from "../resena.service";
import { IResenasRepository, ResenaUsuario } from "../resena.types";
import { Pelicula, Prisma } from "@prisma/client";
import { AppError } from "../../../common/errors/AppError";

function makePelicula(): Pelicula {
    return {
        id: 1,
        titulo: "Coco",
        sinopsis: "Una historia sobre la familia y la música",
        duracionMinutos: 105,
        genero: "Animación",
        clasificacion: "TP",
        posterUrl: "poster.jpg",
        estado: "activa",
        precioBaseExperiencia: new Prisma.Decimal(15000),
    };
}

function makeResena(
    id: number,
    calificacionPelicula: number,
    calificacionExperiencia: number,
    comentario: string | null = "Excelente experiencia"
): ResenaUsuario {
    return {
        id,
        calificacionPelicula,
        calificacionExperiencia,
        comentario,
        fechaCreacion: new Date("2026-10-15T12:00:00.000Z"),
        reserva: {
            usuario: {
                nombre: `Usuario ${id}`,
            },
        },
    } as unknown as ResenaUsuario;
}

describe("ResenasService", () => {
    let repo: jest.Mocked<IResenasRepository>;
    let service: ResenasService;

    beforeEach(() => {
        repo = {
            findPeliculaById: jest.fn(),
            findByPeliculaId: jest.fn(),
        };

        service = new ResenasService(repo);
    });

    describe("obtenerPorPelicula", () => {
        it("rechaza un ID de película inválido con error 400", async () => {
            const idsInvalidos = [0, -1, 1.5, NaN];

            for (const id of idsInvalidos) {
                await expect(
                    service.obtenerPorPelicula(id)
                ).rejects.toMatchObject({
                    statusCode: 400,
                    message: "El ID de la película no es válido",
                });
            }

            expect(repo.findPeliculaById).not.toHaveBeenCalled();
            expect(repo.findByPeliculaId).not.toHaveBeenCalled();
        });

        it("lanza error 404 cuando la película no existe", async () => {
            repo.findPeliculaById.mockResolvedValue(null);

            await expect(
                service.obtenerPorPelicula(99)
            ).rejects.toBeInstanceOf(AppError);

            expect(repo.findPeliculaById).toHaveBeenCalledWith(99);
            expect(repo.findByPeliculaId).not.toHaveBeenCalled();
        });

        it("devuelve la película y un resumen vacío cuando no tiene reseñas", async () => {
            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockResolvedValue([]);

            const resultado = await service.obtenerPorPelicula(1);

            expect(resultado).toEqual({
                pelicula: {
                    id: 1,
                    titulo: "Coco",
                },
                resumen: {
                    totalResenas: 0,
                    promedioPelicula: null,
                    promedioExperiencia: null,
                },
                resenas: [],
            });

            expect(repo.findPeliculaById).toHaveBeenCalledWith(1);
            expect(repo.findByPeliculaId).toHaveBeenCalledWith(1);
        });

        it("calcula correctamente los promedios cuando existe una reseña", async () => {
            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockResolvedValue([
                makeResena(1, 5, 4),
            ]);

            const resultado = await service.obtenerPorPelicula(1);

            expect(resultado.resumen).toEqual({
                totalResenas: 1,
                promedioPelicula: 5,
                promedioExperiencia: 4,
            });

            expect(resultado.resenas).toHaveLength(1);
        });

        it("calcula los promedios correctamente con varias reseñas", async () => {
            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockResolvedValue([
                makeResena(1, 5, 4),
                makeResena(2, 3, 5),
                makeResena(3, 4, 3),
            ]);

            const resultado = await service.obtenerPorPelicula(1);

            expect(resultado.resumen).toEqual({
                totalResenas: 3,
                promedioPelicula: 4,
                promedioExperiencia: 4,
            });
        });

        it("redondea los promedios a un decimal", async () => {
            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockResolvedValue([
                makeResena(1, 5, 4),
                makeResena(2, 4, 3),
                makeResena(3, 4, 4),
            ]);

            const resultado = await service.obtenerPorPelicula(1);

            expect(resultado.resumen.promedioPelicula).toBe(4.3);
            expect(resultado.resumen.promedioExperiencia).toBe(3.7);
        });

        it("transforma las reseñas con los datos necesarios para el frontend", async () => {
            const fecha = new Date("2026-10-15T12:00:00.000Z");

            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockResolvedValue([
                makeResena(7, 5, 4, "Muy buena experiencia"),
            ]);

            const resultado = await service.obtenerPorPelicula(1);

            expect(resultado.resenas[0]).toEqual({
                id: 7,
                usuario: "Usuario 7",
                calificacionPelicula: 5,
                calificacionExperiencia: 4,
                comentario: "Muy buena experiencia",
                fechaCreacion: fecha,
            });
        });

        it("permite devolver reseñas sin comentario", async () => {
            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockResolvedValue([
                makeResena(1, 4, 5, null),
            ]);

            const resultado = await service.obtenerPorPelicula(1);

            expect(resultado.resenas[0].comentario).toBeNull();
        });

        it("propaga los errores del repositorio al consultar la película", async () => {
            repo.findPeliculaById.mockRejectedValue(
                new Error("Error de conexión")
            );

            await expect(
                service.obtenerPorPelicula(1)
            ).rejects.toThrow("Error de conexión");

            expect(repo.findByPeliculaId).not.toHaveBeenCalled();
        });

        it("propaga los errores del repositorio al consultar las reseñas", async () => {
            repo.findPeliculaById.mockResolvedValue(makePelicula());
            repo.findByPeliculaId.mockRejectedValue(
                new Error("Error al consultar reseñas")
            );

            await expect(
                service.obtenerPorPelicula(1)
            ).rejects.toThrow("Error al consultar reseñas");
        });
    });
});
