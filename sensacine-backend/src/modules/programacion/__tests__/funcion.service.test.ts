import { FuncionService } from "../funcion.service";
import { FuncionConDetalles, IFuncionRepository } from "../funcion.types";
import { IPeliculaRepository } from "../../catalogo/pelicula.types";
import { ISalaRepository, SalaConDetalles } from "../sala.types";
import { AppError } from "../../../common/errors/AppError";
import { Pelicula, Prisma } from "@prisma/client";

function makeFakeFuncionRepo(initialFunciones: FuncionConDetalles[] = []): IFuncionRepository {
  let funciones = [...initialFunciones];

  return {
    findAll: jest.fn(async () => funciones),
    findById: jest.fn(async (id: number) => funciones.find((f) => f.id === id) || null),
    findConflicts: jest.fn(async (idSala, fecha, horaInicio, horaFin, excludeId) => {
      return funciones.filter((f) => {
        if (f.idSala !== idSala) return false;
        if (f.estado === "cancelada") return false;
        if (excludeId && f.id === excludeId) return false;
        if (f.fecha.getTime() !== fecha.getTime()) return false;

        // Overlap: (f.horaInicio < horaFin) && (f.horaFin > horaInicio)
        return f.horaInicio.getTime() < horaFin.getTime() && f.horaFin.getTime() > horaInicio.getTime();
      });
    }),
    create: jest.fn(async (data) => {
      const nueva: FuncionConDetalles = {
        id: funciones.length + 1,
        idPelicula: data.idPelicula,
        idSala: data.idSala,
        fecha: data.fecha,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        precioAsientoOficial: new Prisma.Decimal(Number(data.precioAsientoOficial)),
        estado: data.estado ?? "programada",
      };
      funciones.push(nueva);
      return nueva;
    }),
    update: jest.fn(async (id, data) => {
      const index = funciones.findIndex((f) => f.id === id);
      if (index === -1) throw new Error("Not found");
      const updated = {
        ...funciones[index],
        ...data,
        precioAsientoOficial: data.precioAsientoOficial
          ? new Prisma.Decimal(Number(data.precioAsientoOficial))
          : funciones[index].precioAsientoOficial,
      };
      funciones[index] = updated;
      return updated;
    }),
    delete: jest.fn(async (id) => {
      const index = funciones.findIndex((f) => f.id === id);
      if (index === -1) throw new Error("Not found");
      const deleted = funciones[index];
      funciones = funciones.filter((f) => f.id !== id);
      return deleted;
    }),
  };
}

describe("FuncionService", () => {
  const samplePelicula: Pelicula = {
    id: 1,
    titulo: "Dune: Part Two",
    sinopsis: "Paul Atreides se une a los Fremen.",
    duracionMinutos: 120, // 2 horas
    genero: "Ciencia Ficción",
    clasificacion: "PG-13",
    posterUrl: "https://example.com/dune.jpg",
    estado: "activa",
    precioBaseExperiencia: new Prisma.Decimal(30000),
  };

  const sampleSala1: SalaConDetalles = {
    id: 1,
    nombre: "Sala 1 - Premiere Atmos",
    capacidad: 40,
    estado: "activa",
  };

  const sampleSala2: SalaConDetalles = {
    id: 2,
    nombre: "Sala 2 - IMAX Sensorial",
    capacidad: 50,
    estado: "activa",
  };

  const fakePeliculaRepo: IPeliculaRepository = {
    findAll: jest.fn(async () => [samplePelicula]),
    findById: jest.fn(async (id) => (id === 1 ? samplePelicula : null)),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const fakeSalaRepo: ISalaRepository = {
    findAll: jest.fn(async () => [sampleSala1, sampleSala2]),
    findById: jest.fn(async (id) => (id === 1 ? sampleSala1 : id === 2 ? sampleSala2 : null)),
    create: jest.fn(),
    createAsientos: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteAsientosBySala: jest.fn(),
  };

  it("crear debe calcular automáticamente horaFin y guardar la función", async () => {
    const funcionRepo = makeFakeFuncionRepo([]);
    const service = new FuncionService(funcionRepo, fakePeliculaRepo, fakeSalaRepo);

    const result = await service.crear({
      idPelicula: 1,
      idSala: 1,
      fecha: "2026-09-20",
      horaInicio: "14:00",
      precioAsientoOficial: 30000,
    });

    expect(result.id).toBe(1);
    expect(result.fecha).toBe("2026-09-20");
    expect(result.horaInicio).toBe("14:00");
    // 14:00 + 120 min = 16:00
    expect(result.horaFin).toBe("16:00");
    expect(result.precioAsientoOficial).toBe(30000);
  });

  it("crear debe BLOQUEAR cualquier intento de solapamiento en la misma sala y horario (error 409)", async () => {
    const fecha = new Date(Date.UTC(2026, 8, 20)); // 2026-09-20
    const horaInicioExistente = new Date(Date.UTC(1970, 0, 1, 14, 0, 0)); // 14:00
    const horaFinExistente = new Date(Date.UTC(1970, 0, 1, 16, 0, 0)); // 16:00

    const funcionExistente: FuncionConDetalles = {
      id: 1,
      idPelicula: 1,
      idSala: 1,
      fecha,
      horaInicio: horaInicioExistente,
      horaFin: horaFinExistente,
      precioAsientoOficial: new Prisma.Decimal(30000),
      estado: "programada",
      pelicula: samplePelicula,
      sala: sampleSala1,
    };

    const funcionRepo = makeFakeFuncionRepo([funcionExistente]);
    const service = new FuncionService(funcionRepo, fakePeliculaRepo, fakeSalaRepo);

    // Intento 1: Empezar a las 15:00 (en medio de la existente de 14:00 a 16:00)
    await expect(
      service.crear({
        idPelicula: 1,
        idSala: 1,
        fecha: "2026-09-20",
        horaInicio: "15:00",
        precioAsientoOficial: 30000,
      })
    ).rejects.toThrow(/Conflicto de horario/);

    // Intento 2: Empezar a las 13:00 con duración de 2h (terminaría a las 15:00, cruzando con 14:00)
    await expect(
      service.crear({
        idPelicula: 1,
        idSala: 1,
        fecha: "2026-09-20",
        horaInicio: "13:00",
        precioAsientoOficial: 30000,
      })
    ).rejects.toThrow(/Conflicto de horario/);
  });

  it("crear debe PERMITIR programar en la misma sala después de que termine la anterior", async () => {
    const fecha = new Date(Date.UTC(2026, 8, 20));
    const horaInicioExistente = new Date(Date.UTC(1970, 0, 1, 14, 0, 0));
    const horaFinExistente = new Date(Date.UTC(1970, 0, 1, 16, 0, 0));

    const funcionExistente: FuncionConDetalles = {
      id: 1,
      idPelicula: 1,
      idSala: 1,
      fecha,
      horaInicio: horaInicioExistente,
      horaFin: horaFinExistente,
      precioAsientoOficial: new Prisma.Decimal(30000),
      estado: "programada",
    };

    const funcionRepo = makeFakeFuncionRepo([funcionExistente]);
    const service = new FuncionService(funcionRepo, fakePeliculaRepo, fakeSalaRepo);

    // A partir de las 16:30 no hay solapamiento
    const result = await service.crear({
      idPelicula: 1,
      idSala: 1,
      fecha: "2026-09-20",
      horaInicio: "16:30",
      precioAsientoOficial: 30000,
    });

    expect(result.id).toBe(2);
    expect(result.horaInicio).toBe("16:30");
    expect(result.horaFin).toBe("18:30");
  });

  it("crear debe PERMITIR programar al mismo horario si es en una SALA DIFERENTE", async () => {
    const fecha = new Date(Date.UTC(2026, 8, 20));
    const horaInicioExistente = new Date(Date.UTC(1970, 0, 1, 14, 0, 0));
    const horaFinExistente = new Date(Date.UTC(1970, 0, 1, 16, 0, 0));

    const funcionExistente: FuncionConDetalles = {
      id: 1,
      idPelicula: 1,
      idSala: 1, // Sala 1
      fecha,
      horaInicio: horaInicioExistente,
      horaFin: horaFinExistente,
      precioAsientoOficial: new Prisma.Decimal(30000),
      estado: "programada",
    };

    const funcionRepo = makeFakeFuncionRepo([funcionExistente]);
    const service = new FuncionService(funcionRepo, fakePeliculaRepo, fakeSalaRepo);

    // Mismo horario (14:00 a 16:00), pero en Sala 2
    const result = await service.crear({
      idPelicula: 1,
      idSala: 2, // Sala 2
      fecha: "2026-09-20",
      horaInicio: "14:00",
      precioAsientoOficial: 30000,
    });

    expect(result.id).toBe(2);
    expect(result.idSala).toBe(2);
  });

  it("listar con soloFuturas debe omitir funciones pasadas", async () => {
    const pasada: FuncionConDetalles = {
      id: 10,
      idPelicula: 1,
      idSala: 1,
      fecha: new Date(Date.UTC(2020, 0, 1)), // 2020 (pasada)
      horaInicio: new Date(Date.UTC(1970, 0, 1, 10, 0, 0)),
      horaFin: new Date(Date.UTC(1970, 0, 1, 12, 0, 0)),
      precioAsientoOficial: new Prisma.Decimal(25000),
      estado: "programada",
    };

    const futura: FuncionConDetalles = {
      id: 11,
      idPelicula: 1,
      idSala: 1,
      fecha: new Date(Date.UTC(2030, 0, 1)), // 2030 (futura)
      horaInicio: new Date(Date.UTC(1970, 0, 1, 15, 0, 0)),
      horaFin: new Date(Date.UTC(1970, 0, 1, 17, 0, 0)),
      precioAsientoOficial: new Prisma.Decimal(25000),
      estado: "programada",
    };

    const funcionRepo = makeFakeFuncionRepo([pasada, futura]);
    const service = new FuncionService(funcionRepo, fakePeliculaRepo, fakeSalaRepo);

    const result = await service.listar({ soloFuturas: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(11);
  });
});

