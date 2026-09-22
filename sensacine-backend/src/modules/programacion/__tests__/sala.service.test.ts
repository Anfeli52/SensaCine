import { SalaService } from "../sala.service";
import { ISalaRepository, SalaConDetalles } from "../sala.types";
import { AppError } from "../../../common/errors/AppError";
import { Sala } from "@prisma/client";

function makeFakeSalaRepo(initialSalas: SalaConDetalles[] = []): ISalaRepository {
  let salas = [...initialSalas];
  let asientosDb: { idSala: number; fila: string; numero: number }[] = [];

  return {
    findAll: jest.fn(async () => salas),
    findById: jest.fn(async (id: number) => {
      const found = salas.find((s) => s.id === id);
      if (!found) return null;
      return {
        ...found,
        asientos: asientosDb.filter((a) => a.idSala === id) as any,
      };
    }),
    create: jest.fn(async (data) => {
      const nueva: SalaConDetalles = {
        id: salas.length + 1,
        nombre: data.nombre,
        capacidad: data.capacidad,
        estado: data.estado ?? "activa",
        _count: { funciones: 0, asientos: 0 },
      };
      salas.push(nueva);
      return nueva;
    }),
    createAsientos: jest.fn(async (asientos) => {
      asientosDb.push(...asientos);
    }),
    update: jest.fn(async (id, data) => {
      const index = salas.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Not found");
      const updated = { ...salas[index], ...data };
      salas[index] = updated;
      return updated;
    }),
    delete: jest.fn(async (id) => {
      const index = salas.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Not found");
      const deleted = salas[index];
      salas = salas.filter((s) => s.id !== id);
      return deleted;
    }),
    deleteAsientosBySala: jest.fn(async (idSala) => {
      asientosDb = asientosDb.filter((a) => a.idSala !== idSala);
    }),
  };
}

describe("SalaService", () => {
  const sampleSala: SalaConDetalles = {
    id: 1,
    nombre: "Sala 1 - Premiere Atmos",
    capacidad: 40,
    estado: "activa",
    _count: { funciones: 0, asientos: 40 },
  };

  it("crear debe registrar la sala y generar los asientos correspondientes", async () => {
    const repo = makeFakeSalaRepo([]);
    const service = new SalaService(repo);

    const result = await service.crear({
      nombre: "Sala 1 - Premiere Atmos",
      filas: 5,
      asientosPorFila: 8,
    });

    expect(result.id).toBe(1);
    expect(result.nombre).toBe("Sala 1 - Premiere Atmos");
    expect(result.capacidad).toBe(40);
    expect(repo.createAsientos).toHaveBeenCalledTimes(1);

    const createdAsientos = (repo.createAsientos as jest.Mock).mock.calls[0][0];
    expect(createdAsientos).toHaveLength(40);
    expect(createdAsientos[0]).toEqual({ idSala: 1, fila: "A", numero: 1 });
    expect(createdAsientos[39]).toEqual({ idSala: 1, fila: "E", numero: 8 });
  });

  it("obtenerPorId debe retornar la sala si existe", async () => {
    const repo = makeFakeSalaRepo([sampleSala]);
    const service = new SalaService(repo);

    const result = await service.obtenerPorId(1);
    expect(result.id).toBe(1);
    expect(result.nombre).toBe(sampleSala.nombre);
  });

  it("obtenerPorId debe lanzar AppError 404 si la sala no existe", async () => {
    const repo = makeFakeSalaRepo([]);
    const service = new SalaService(repo);

    await expect(service.obtenerPorId(999)).rejects.toThrow(AppError);
  });

  it("eliminar debe fallar si la sala tiene funciones asociadas", async () => {
    const salaConFunciones: SalaConDetalles = {
      ...sampleSala,
      _count: { funciones: 3, asientos: 40 },
    };
    const repo = makeFakeSalaRepo([salaConFunciones]);
    const service = new SalaService(repo);

    await expect(service.eliminar(1)).rejects.toThrow(
      /tiene funciones programadas asociadas/
    );
  });

  it("eliminar debe borrar la sala y sus asientos si no tiene funciones asociadas", async () => {
    const repo = makeFakeSalaRepo([sampleSala]);
    const service = new SalaService(repo);

    const result = await service.eliminar(1);
    expect(result.id).toBe(1);
    expect(repo.deleteAsientosBySala).toHaveBeenCalledWith(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});
