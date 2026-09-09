import { PeliculaService } from "../pelicula.service";
import { IPeliculaRepository } from "../pelicula.types";
import { AppError } from "../../../common/errors/AppError";
import { Pelicula, Prisma } from "@prisma/client";

function makeFakePeliculaRepo(initialPeliculas: Pelicula[] = []): IPeliculaRepository {
  let peliculas = [...initialPeliculas];

  return {
    findAll: jest.fn(async (options) => {
      if (options?.estado) {
        return peliculas.filter((p) => p.estado === options.estado);
      }
      return peliculas;
    }),
    findById: jest.fn(async (id) => peliculas.find((p) => p.id === id) || null),
    create: jest.fn(async (data) => {
      const nueva: Pelicula = {
        id: peliculas.length + 1,
        titulo: data.titulo,
        sinopsis: data.sinopsis ?? null,
        duracionMinutos: data.duracionMinutos,
        genero: data.genero ?? null,
        clasificacion: data.clasificacion ?? null,
        posterUrl: data.posterUrl ?? null,
        estado: data.estado ?? "activa",
        precioBaseExperiencia: new Prisma.Decimal(Number(data.precioBaseExperiencia)),
      };
      peliculas.push(nueva);
      return nueva;
    }),
    update: jest.fn(async (id, data) => {
      const index = peliculas.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Not found");
      const updated: Pelicula = {
        ...peliculas[index],
        ...data,
        precioBaseExperiencia: data.precioBaseExperiencia
          ? new Prisma.Decimal(Number(data.precioBaseExperiencia))
          : peliculas[index].precioBaseExperiencia,
      };
      peliculas[index] = updated;
      return updated;
    }),
    delete: jest.fn(async (id) => {
      const index = peliculas.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Not found");
      const deleted = peliculas[index];
      peliculas = peliculas.filter((p) => p.id !== id);
      return deleted;
    }),
  };
}

describe("PeliculaService", () => {
  const samplePelicula: Pelicula = {
    id: 1,
    titulo: "Spider-Man: Across the Spider-Verse",
    sinopsis: "Miles Morales viaja a través del Multiverso.",
    duracionMinutos: 140,
    genero: "Animación / Acción",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/sample.jpg",
    estado: "activa",
    precioBaseExperiencia: new Prisma.Decimal(25000),
  };

  it("listarActivas debe devolver solo las películas con estado activa", async () => {
    const inactiva: Pelicula = { ...samplePelicula, id: 2, estado: "inactiva" };
    const repo = makeFakePeliculaRepo([samplePelicula, inactiva]);
    const service = new PeliculaService(repo);

    const result = await service.listarActivas();

    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe("Spider-Man: Across the Spider-Verse");
    expect(result[0].precioBaseExperiencia).toBe(25000);
  });

  it("obtenerPorId debe devolver la película si existe", async () => {
    const repo = makeFakePeliculaRepo([samplePelicula]);
    const service = new PeliculaService(repo);

    const result = await service.obtenerPorId(1);
    expect(result.id).toBe(1);
    expect(result.titulo).toBe(samplePelicula.titulo);
  });

  it("obtenerPorId debe lanzar AppError 404 si la película no existe", async () => {
    const repo = makeFakePeliculaRepo([]);
    const service = new PeliculaService(repo);

    await expect(service.obtenerPorId(999)).rejects.toThrow(AppError);
  });

  it("crear debe registrar una película correctamente", async () => {
    const repo = makeFakePeliculaRepo([]);
    const service = new PeliculaService(repo);

    const result = await service.crear({
      titulo: "Interstellar",
      duracionMinutos: 169,
      genero: "Ciencia Ficción",
      precioBaseExperiencia: 30000,
    });

    expect(result.id).toBe(1);
    expect(result.titulo).toBe("Interstellar");
    expect(result.duracionMinutos).toBe(169);
  });

  it("crear debe fallar si la duración es menor o igual a 0", async () => {
    const repo = makeFakePeliculaRepo([]);
    const service = new PeliculaService(repo);

    await expect(
      service.crear({
        titulo: "Test",
        duracionMinutos: 0,
        precioBaseExperiencia: 10000,
      })
    ).rejects.toThrow(AppError);
  });

  it("actualizar debe modificar los campos especificados", async () => {
    const repo = makeFakePeliculaRepo([samplePelicula]);
    const service = new PeliculaService(repo);

    const result = await service.actualizar(1, {
      titulo: "Spider-Man: Versión Extendida",
      duracionMinutos: 150,
    });

    expect(result.titulo).toBe("Spider-Man: Versión Extendida");
    expect(result.duracionMinutos).toBe(150);
  });

  it("eliminar debe borrar la película y confirmar", async () => {
    const repo = makeFakePeliculaRepo([samplePelicula]);
    const service = new PeliculaService(repo);

    const result = await service.eliminar(1);
    expect(result.id).toBe(1);
    expect(result.mensaje).toContain("eliminada exitosamente");
  });
});
