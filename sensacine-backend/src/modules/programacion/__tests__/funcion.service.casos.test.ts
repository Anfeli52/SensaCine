import { FuncionService } from "../funcion.service";
import { IFuncionRepository } from "../funcion.types";
import { IPeliculaRepository } from "../../catalogo/pelicula.types";
import { ISalaRepository } from "../sala.types";

const hora = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00.000Z`);
const dia = (yyyymmdd: string) => new Date(`${yyyymmdd}T00:00:00.000Z`);

const pelicula = { id: 1, titulo: "Coco", duracionMinutos: 105, genero: "Animada", clasificacion: "TP", posterUrl: "p.jpg" };
const sala = { id: 2, nombre: "Sala 2", capacidad: 40, estado: "activa" };

const funcion = (over: Record<string, unknown> = {}) =>
  ({
    id: 10,
    idPelicula: 1,
    idSala: 2,
    fecha: dia("2026-11-10"),
    horaInicio: hora("14:00"),
    horaFin: hora("15:45"),
    precioAsientoOficial: 25000,
    estado: "programada",
    pelicula,
    sala,
    ...over,
  }) as any;

describe("FuncionService (reglas de programación)", () => {
  let funcionRepo: jest.Mocked<IFuncionRepository>;
  let peliculaRepo: jest.Mocked<IPeliculaRepository>;
  let salaRepo: jest.Mocked<ISalaRepository>;
  let service: FuncionService;

  beforeEach(() => {
    funcionRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findConflicts: jest.fn(async () => []),
      create: jest.fn(async (d: any) => funcion({ ...d })),
      update: jest.fn(async (_id: number, d: any) => funcion({ ...d })),
      delete: jest.fn(),
    } as any;
    peliculaRepo = { findById: jest.fn(async () => pelicula) } as any;
    salaRepo = { findById: jest.fn(async () => sala) } as any;
    service = new FuncionService(funcionRepo, peliculaRepo, salaRepo);
  });

  describe("conversión de fechas y horas", () => {
    it("parseDate acepta texto ISO y objetos Date sin desplazar el día", () => {
      expect(service.parseDate("2026-11-10T23:59:00.000Z")).toEqual(dia("2026-11-10"));
      expect(service.parseDate(new Date("2026-11-10T23:30:00.000Z"))).toEqual(dia("2026-11-10"));
    });

    it("parseTime acepta HH:mm, HH:mm:ss y objetos Date", () => {
      expect(service.parseTime("14:30")).toEqual(hora("14:30"));
      expect(service.parseTime("14:30:15").getUTCSeconds()).toBe(15);
      expect(service.parseTime(new Date("2026-11-10T09:05:00.000Z"))).toEqual(hora("09:05"));
    });

    it("formatTime y formatDate rellenan con ceros", () => {
      expect(service.formatTime(hora("07:05"))).toBe("07:05");
      expect(service.formatDate(dia("2026-01-02"))).toBe("2026-01-02");
    });
  });

  describe("listar", () => {
    it("convierte a DTO con película y sala", async () => {
      funcionRepo.findAll.mockResolvedValue([funcion()]);
      const [dto] = await service.listar();
      expect(dto).toMatchObject({
        id: 10, fecha: "2026-11-10", horaInicio: "14:00", horaFin: "15:45", precioAsientoOficial: 25000,
        pelicula: { titulo: "Coco" }, sala: { nombre: "Sala 2" },
      });
    });

    it("omite película y sala si el repositorio no las trae", async () => {
      funcionRepo.findAll.mockResolvedValue([funcion({ pelicula: undefined, sala: undefined })]);
      const [dto] = await service.listar();
      expect(dto.pelicula).toBeUndefined();
      expect(dto.sala).toBeUndefined();
    });

    describe("soloFuturas", () => {
      beforeEach(() => {
        jest.useFakeTimers();
        // 10 nov 2026, 15:00 en Bogotá (UTC-5) = 20:00 UTC
        jest.setSystemTime(new Date("2026-11-10T20:00:00.000Z"));
      });
      afterEach(() => jest.useRealTimers());

      it("descarta funciones pasadas y de hoy ya terminadas, y conserva las vigentes y futuras", async () => {
        funcionRepo.findAll.mockResolvedValue([
          funcion({ id: 1, fecha: dia("2026-11-09") }),                                         // ayer
          funcion({ id: 2, horaInicio: hora("09:00"), horaFin: hora("11:00") }),                // hoy, terminada
          funcion({ id: 3, horaInicio: hora("14:00"), horaFin: hora("16:00") }),                // hoy, en curso
          funcion({ id: 4, horaInicio: hora("18:00"), horaFin: hora("20:00") }),                // hoy, por empezar
          funcion({ id: 5, fecha: dia("2026-11-11") }),                                         // mañana
        ]);
        const ids = (await service.listar({ soloFuturas: true })).map((f) => f.id);
        expect(ids).toEqual([3, 4, 5]);
      });
    });
  });

  describe("obtenerPorId", () => {
    it("lanza 404 si no existe", async () => {
      funcionRepo.findById.mockResolvedValue(null);
      await expect(service.obtenerPorId(99)).rejects.toMatchObject({ statusCode: 404 });
    });
    it("devuelve la función", async () => {
      funcionRepo.findById.mockResolvedValue(funcion());
      expect((await service.obtenerPorId(10)).id).toBe(10);
    });
  });

  describe("crear", () => {
    const base = { idPelicula: 1, idSala: 2, fecha: "2026-11-10", horaInicio: "14:00", precioAsientoOficial: 25000 };

    it("lanza 404 si la película no existe", async () => {
      peliculaRepo.findById.mockResolvedValue(null);
      await expect(service.crear(base)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("lanza 404 si la sala no existe", async () => {
      salaRepo.findById.mockResolvedValue(null);
      await expect(service.crear(base)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("lanza 400 si la sala no está activa", async () => {
      salaRepo.findById.mockResolvedValue({ ...sala, estado: "mantenimiento" } as any);
      await expect(service.crear(base)).rejects.toMatchObject({ statusCode: 400 });
      expect(funcionRepo.create).not.toHaveBeenCalled();
    });

    it("calcula la hora de fin con la duración de la película", async () => {
      await service.crear(base);
      expect(funcionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ horaInicio: hora("14:00"), horaFin: hora("15:45"), estado: "programada" })
      );
    });

    it("respeta una hora de fin explícita y un estado dado", async () => {
      await service.crear({ ...base, horaFin: "16:30", estado: "cancelada" });
      expect(funcionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ horaFin: hora("16:30"), estado: "cancelada" })
      );
    });

    it("lanza 400 si la hora de fin no es posterior a la de inicio", async () => {
      await expect(service.crear({ ...base, horaFin: "14:00" })).rejects.toMatchObject({ statusCode: 400 });
      await expect(service.crear({ ...base, horaFin: "13:00" })).rejects.toMatchObject({ statusCode: 400 });
    });

    it("lanza 409 si choca con otra función de la sala, nombrando la película en conflicto", async () => {
      funcionRepo.findConflicts.mockResolvedValue([funcion({ pelicula: { ...pelicula, titulo: "Dune" } })]);
      const error = await service.crear(base).catch((e) => e);
      expect(error.statusCode).toBe(409);
      expect(error.message).toContain("Dune");
      expect(error.message).toContain("14:00");
    });

    it("usa un nombre genérico si el conflicto no trae la película", async () => {
      funcionRepo.findConflicts.mockResolvedValue([funcion({ pelicula: undefined })]);
      await expect(service.crear(base)).rejects.toThrow("Otra película");
    });
  });

  describe("actualizar", () => {
    beforeEach(() => funcionRepo.findById.mockResolvedValue(funcion()));

    it("lanza 404 si la función no existe", async () => {
      funcionRepo.findById.mockResolvedValue(null);
      await expect(service.actualizar(10, {})).rejects.toMatchObject({ statusCode: 404 });
    });

    it("lanza 404 si la nueva película o sala no existen", async () => {
      peliculaRepo.findById.mockResolvedValueOnce(null);
      await expect(service.actualizar(10, { idPelicula: 99 })).rejects.toMatchObject({ statusCode: 404 });
      salaRepo.findById.mockResolvedValueOnce(null);
      await expect(service.actualizar(10, { idSala: 99 })).rejects.toMatchObject({ statusCode: 404 });
    });

    it("sin cambios de horario conserva la hora de fin y excluye a la propia función del chequeo", async () => {
      await service.actualizar(10, { precioAsientoOficial: 30000 });
      expect(funcionRepo.findConflicts).toHaveBeenCalledWith(2, dia("2026-11-10"), hora("14:00"), hora("15:45"), 10);
      expect(funcionRepo.update).toHaveBeenCalledWith(10, expect.objectContaining({ horaFin: hora("15:45"), precioAsientoOficial: 30000 }));
    });

    it("al cambiar la hora de inicio recalcula la de fin con la duración", async () => {
      await service.actualizar(10, { horaInicio: "18:00" });
      expect(funcionRepo.update).toHaveBeenCalledWith(10, expect.objectContaining({ horaInicio: hora("18:00"), horaFin: hora("19:45") }));
    });

    it("usa la hora de fin explícita si se envía", async () => {
      await service.actualizar(10, { horaFin: "17:00" });
      expect(funcionRepo.update).toHaveBeenCalledWith(10, expect.objectContaining({ horaFin: hora("17:00") }));
    });

    it("al cambiar la fecha la normaliza", async () => {
      await service.actualizar(10, { fecha: "2026-11-12T10:00:00.000Z" });
      expect(funcionRepo.update).toHaveBeenCalledWith(10, expect.objectContaining({ fecha: dia("2026-11-12") }));
    });

    it("lanza 400 si la hora de fin queda antes que la de inicio", async () => {
      await expect(service.actualizar(10, { horaFin: "13:00" })).rejects.toMatchObject({ statusCode: 400 });
      expect(funcionRepo.update).not.toHaveBeenCalled();
    });

    it("lanza 409 si el nuevo horario choca con otra función", async () => {
      funcionRepo.findConflicts.mockResolvedValue([funcion({ id: 11, pelicula: { ...pelicula, titulo: "Dune" } })]);
      const error = await service.actualizar(10, { horaInicio: "15:00" }).catch((e) => e);
      expect(error.statusCode).toBe(409);
      expect(error.message).toContain("Dune");
    });

    it("usa un nombre genérico si el conflicto no trae la película", async () => {
      funcionRepo.findConflicts.mockResolvedValue([funcion({ id: 11, pelicula: undefined })]);
      await expect(service.actualizar(10, { horaInicio: "15:00" })).rejects.toThrow("Otra película");
    });
  });

  describe("eliminar", () => {
    it("lanza 404 si no existe", async () => {
      funcionRepo.findById.mockResolvedValue(null);
      await expect(service.eliminar(10)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("elimina una función existente", async () => {
      funcionRepo.findById.mockResolvedValue(funcion());
      expect(await service.eliminar(10)).toMatchObject({ id: 10 });
      expect(funcionRepo.delete).toHaveBeenCalledWith(10);
    });

    it("traduce la violación de clave foránea (reservas asociadas) a 400", async () => {
      funcionRepo.findById.mockResolvedValue(funcion());
      funcionRepo.delete.mockRejectedValue({ code: "P2003" });
      await expect(service.eliminar(10)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("propaga cualquier otro error", async () => {
      funcionRepo.findById.mockResolvedValue(funcion());
      funcionRepo.delete.mockRejectedValue(new Error("boom"));
      await expect(service.eliminar(10)).rejects.toThrow("boom");
    });
  });
});
