import { SalaService } from "../sala.service";
import { ISalaRepository } from "../sala.types";

describe("SalaService (distribución de asientos y casos límite)", () => {
  let repo: jest.Mocked<ISalaRepository>;
  let service: SalaService;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(async (d: any) => ({ id: 1, ...d })) as any,
      createAsientos: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteAsientosBySala: jest.fn(),
    };
    service = new SalaService(repo);
  });

  const asientosCreados = () => repo.createAsientos.mock.calls[0][0];

  it("listarTodas delega en el repositorio", async () => {
    repo.findAll.mockResolvedValue([{ id: 1 }] as any);
    expect(await service.listarTodas()).toEqual([{ id: 1 }]);
  });

  it("obtenerPorId lanza 404 si no existe y devuelve la sala si existe", async () => {
    repo.findById.mockResolvedValueOnce(null);
    await expect(service.obtenerPorId(9)).rejects.toMatchObject({ statusCode: 404 });
    repo.findById.mockResolvedValueOnce({ id: 1 } as any);
    expect(await service.obtenerPorId(1)).toEqual({ id: 1 });
  });

  it("crear con filas y asientosPorFila calcula la capacidad", async () => {
    await service.crear({ nombre: " Sala X ", filas: 3, asientosPorFila: 4 } as any);
    expect(repo.create).toHaveBeenCalledWith({ nombre: "Sala X", capacidad: 12, estado: "activa" });
    expect(asientosCreados()).toHaveLength(12);
    expect(asientosCreados()[0]).toMatchObject({ fila: "A", numero: 1 });
    expect(asientosCreados()[11]).toMatchObject({ fila: "C", numero: 4 });
  });

  it("crear solo con capacidad distribuye en filas de hasta 10 asientos", async () => {
    await service.crear({ nombre: "Sala Y", capacidad: 25 } as any);
    expect(asientosCreados()).toHaveLength(25);
    expect(asientosCreados().at(-1)).toMatchObject({ fila: "C", numero: 5 });
  });

  it("crear sin datos usa el valor por defecto de 5x8 = 40", async () => {
    await service.crear({ nombre: "Sala Z" } as any);
    expect(asientosCreados()).toHaveLength(40);
  });

  it("crear devuelve la sala completa si el repositorio la encuentra", async () => {
    repo.findById.mockResolvedValue({ id: 1, nombre: "Completa" } as any);
    expect(await service.crear({ nombre: "Sala" } as any)).toEqual({ id: 1, nombre: "Completa" });
  });

  it("actualizar lanza 404 si la sala no existe", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.actualizar(1, { nombre: "N" } as any)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("actualizar devuelve la sala actualizada", async () => {
    repo.findById.mockResolvedValue({ id: 1 } as any);
    repo.update.mockResolvedValue({ id: 1, nombre: "N" } as any);
    expect(await service.actualizar(1, { nombre: "N" } as any)).toEqual({ id: 1 });
  });

  it("eliminar lanza 404 si no existe", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.eliminar(1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("eliminar rechaza salas con funciones programadas", async () => {
    repo.findById.mockResolvedValue({ id: 1, _count: { funciones: 2 } } as any);
    await expect(service.eliminar(1)).rejects.toMatchObject({ statusCode: 400 });
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("eliminar borra asientos y sala", async () => {
    repo.findById.mockResolvedValue({ id: 1, _count: { funciones: 0 } } as any);
    expect(await service.eliminar(1)).toMatchObject({ id: 1 });
    expect(repo.deleteAsientosBySala).toHaveBeenCalledWith(1);
  });

  it("eliminar traduce P2003 a 400 y propaga otros errores", async () => {
    repo.findById.mockResolvedValue({ id: 1, _count: { funciones: 0 } } as any);
    repo.delete.mockRejectedValueOnce({ code: "P2003" });
    await expect(service.eliminar(1)).rejects.toMatchObject({ statusCode: 400 });
    repo.delete.mockRejectedValueOnce(new Error("boom"));
    await expect(service.eliminar(1)).rejects.toThrow("boom");
  });
});
