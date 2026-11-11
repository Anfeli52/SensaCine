import { AppError } from "../../common/errors/AppError";
import { IResenasRepository } from "./resena.types";

export class ResenasService {
    constructor(private resenasRepo: IResenasRepository) { }

    async obtenerPorPelicula(idPelicula: number) {
        if (!Number.isInteger(idPelicula) || idPelicula <= 0) {
            throw new AppError("El ID de la película no es válido", 400);
        }

        const pelicula = await this.resenasRepo.findPeliculaById(idPelicula);

        if (!pelicula) {
            throw new AppError("Película no encontrada", 404);
        }

        const resenas = await this.resenasRepo.findByPeliculaId(idPelicula);

        const totalResenas = resenas.length;

        const promedioPelicula = totalResenas > 0
            ? resenas.reduce((total, resena) => total + resena.calificacionPelicula, 0) / totalResenas
            : null;

        const promedioExperiencia = totalResenas > 0
            ? resenas.reduce((total, resena) => total + resena.calificacionExperiencia, 0) / totalResenas
            : null;

        return {
            pelicula: {
                id: pelicula.id,
                titulo: pelicula.titulo,
            },
            resumen: {
                totalResenas,
                promedioPelicula:
                    promedioPelicula !== null
                        ? Number(promedioPelicula.toFixed(1))
                        : null,
                promedioExperiencia:
                    promedioExperiencia !== null
                        ? Number(promedioExperiencia.toFixed(1))
                        : null,
            },
            resenas: resenas.map((resena) => ({
                id: resena.id,
                usuario: resena.reserva.usuario.nombre,
                calificacionPelicula: resena.calificacionPelicula,
                calificacionExperiencia: resena.calificacionExperiencia,
                comentario: resena.comentario,
                fechaCreacion: resena.fechaCreacion,
            })),
        };
    }
}
