import { PeliculaService } from "../pelicula.service";
import { IPeliculaRepository } from "../pelicula.types";

const pelicula = (over: Record<string, unknown> = {}) =>
  ({
    id: 1,
    titulo: "Coco",
    sinopsis: "Música y familia",
    duracionMinutos: 105,
    genero: "Animada",
    clasificacion: "TP",
    posterUrl: "p.jpg",
    estado: "activa",
    precioBaseExperiencia: 15000,
    ...over,
  }) as any;

describe("PeliculaService (listados, validaciones y borrado)", () => {
  let repo: jest.Mocked<IPeliculaRepository>;
  let service: PeliculaService;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(async (d: any) => pelicula(d)),
      update: jest.fn(async (_id: number, d: any) => pelicula(d)),
      delete: jest.fn(),
    } as any;
    service = new PeliculaService(repo);
  });

  it("listarActivas pide solo las películas activas", async () => {
    repo.findAll.mockResolvedValue([pelicula()]);
    expect(await service.listarActivas()).toHaveLength(1);
    expect(repo.findAll).toHaveBeenCalledWith({ estado: "activa" });
  });

  it("listarTodas no aplica filtro y convierte el precio a número", async () => {
    repo.findAll.mockResolvedValue([pelicula({ precioBaseExperiencia: "15000.00" })]);
    const [dto] = await service.listarTodas();
    expect(repo.findAll).toHaveBeenCalledWith();
    expect(dto.precioBaseExperiencia).toBe(15000);
  });

  describe("obtenerPorId", () => {
    it("lanza 404 si no existe", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.obtenerPorId(9)).rejects.toMatchObject({ statusCode: 404 });
    });
    it("devuelve la película", async () => {
      repo.findById.mockResolvedValue(pelicula());
      expect((await service.obtenerPorId(1)).titulo).toBe("Coco");
    });
  });

  describe("crear", () => {
    const dto = { titulo: "Dune", duracionMinutos: 166, precioBaseExperiencia: 20000 } as any;

    it("rechaza una duración de 0 o negativa con 400", async () => {
      await expect(service.crear({ ...dto, duracionMinutos: 0 })).rejects.toMatchObject({ statusCode: 400 });
      await expect(service.crear({ ...dto, duracionMinutos: -5 })).rejects.toMatchObject({ statusCode: 400 });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("crea la película como activa por defecto", async () => {
      await service.crear(dto);
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ titulo: "Dune", estado: "activa" }));
    });

    it("respeta el estado indicado", async () => {
      await service.crear({ ...dto, estado: "inactiva" });
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ estado: "inactiva" }));
    });
  });

  describe("actualizar", () => {
    it("lanza 404 si no existe", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.actualizar(9, { titulo: "X" })).rejects.toMatchObject({ statusCode: 404 });
    });

    it("rechaza una duración no positiva con 400", async () => {
      repo.findById.mockResolvedValue(pelicula());
      await expect(service.actualizar(1, { duracionMinutos: 0 })).rejects.toMatchObject({ statusCode: 400 });
      expect(repo.update).not.toHaveBeenCalled();
    });

    it("actualiza sin tocar la duración y con una duración válida", async () => {
      repo.findById.mockResolvedValue(pelicula());
      await service.actualizar(1, { titulo: "Nuevo" });
      await service.actualizar(1, { duracionMinutos: 120 });
      expect(repo.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("eliminar", () => {
    it("lanza 404 si no existe", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.eliminar(9)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("elimina la película", async () => {
      repo.findById.mockResolvedValue(pelicula());
      expect(await service.eliminar(1)).toMatchObject({ id: 1 });
    });

    it("traduce la violación de clave foránea (funciones o productos asociados) a 400", async () => {
      repo.findById.mockResolvedValue(pelicula());
      repo.delete.mockRejectedValue({ code: "P2003" });
      await expect(service.eliminar(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("propaga cualquier otro error", async () => {
      repo.findById.mockResolvedValue(pelicula());
      repo.delete.mockRejectedValue(new Error("boom"));
      await expect(service.eliminar(1)).rejects.toThrow("boom");
    });
  });
});
