import { CocinaService } from "../cocina.service";
import { FuncionCocina, ICocinaRepository, ReservaCocina } from "../cocina.types";

const asFunciones = (data: unknown) => data as FuncionCocina[];
const asReservas = (data: unknown) => data as ReservaCocina[];

describe("CocinaService (HU-29)", () => {
  let mockRepo: jest.Mocked<ICocinaRepository>;
  let service: CocinaService;

  beforeEach(() => {
    mockRepo = {
      getFuncionesFuturas: jest.fn(),
      getReservasPorFuncion: jest.fn(),
      getReservasPorFunciones: jest.fn(),
    };
    service = new CocinaService(mockRepo);
  });

  describe("listarFuncionesProgramadas", () => {
    it("debe retornar mensaje informativo cuando no hay funciones disponibles (Criterio 4)", async () => {
      mockRepo.getFuncionesFuturas.mockResolvedValue([]);

      const resultado = await service.listarFuncionesProgramadas();

      expect(resultado.total).toBe(0);
      expect(resultado.funciones).toEqual([]);
      expect(resultado.mensaje).toBe("No hay funciones disponibles");
    });

    it("debe obtener funciones a futuro y asociarles sus reservas", async () => {
      const funcionesMock = [
        {
          id: 1,
          fecha: new Date("2026-10-28"),
          horaInicio: new Date("1970-01-01T15:00:00Z"),
          pelicula: { id: 1, titulo: "Spider-Man" },
          sala: { id: 2, nombre: "Sala 1" },
        },
        {
          id: 2,
          fecha: new Date("2026-10-28"),
          horaInicio: new Date("1970-01-01T19:00:00Z"),
          pelicula: { id: 2, titulo: "Dune" },
          sala: { id: 3, nombre: "Sala 2" },
        },
      ];

      const reservasMock = [
        { id: 101, idFuncion: 1, usuario: { nombre: "Carlos" }, asientos: [{ id: 1 }] },
        { id: 102, idFuncion: 1, usuario: { nombre: "Ana" }, asientos: [{ id: 2 }] },
      ];

      mockRepo.getFuncionesFuturas.mockResolvedValue(asFunciones(funcionesMock));
      mockRepo.getReservasPorFunciones.mockResolvedValue(asReservas(reservasMock));

      const resultado = await service.listarFuncionesProgramadas();

      expect(mockRepo.getFuncionesFuturas).toHaveBeenCalledTimes(1);
      expect(mockRepo.getReservasPorFunciones).toHaveBeenCalledWith([1, 2]);

      expect(resultado.total).toBe(2);
      expect(resultado.funciones).toHaveLength(2);

      // Función 1 tiene 2 reservas
      expect(resultado.funciones[0].id).toBe(1);
      expect(resultado.funciones[0].totalReservas).toBe(2);
      expect(resultado.funciones[0].reservas).toHaveLength(2);

      // Función 2 tiene 0 reservas
      expect(resultado.funciones[1].id).toBe(2);
      expect(resultado.funciones[1].totalReservas).toBe(0);
      expect(resultado.funciones[1].reservas).toHaveLength(0);
    });
  });

  describe("obtenerFuncionConReservas", () => {
    it("debe retornar la función con sus reservas", async () => {
      const funcionMock = {
        id: 1,
        pelicula: { titulo: "Spider-Man" },
        sala: { nombre: "Sala 1" },
      };
      const reservasMock = [{ id: 101, idFuncion: 1 }];

      mockRepo.getFuncionesFuturas.mockResolvedValue(asFunciones([funcionMock]));
      mockRepo.getReservasPorFuncion.mockResolvedValue(asReservas(reservasMock));

      const resultado = await service.obtenerFuncionConReservas(1);

      expect(resultado.id).toBe(1);
      expect(resultado.totalReservas).toBe(1);
      expect(mockRepo.getReservasPorFuncion).toHaveBeenCalledWith(1);
    });

    it("debe lanzar 404 si la función no se encuentra", async () => {
      mockRepo.getFuncionesFuturas.mockResolvedValue([]);

      await expect(service.obtenerFuncionConReservas(99)).rejects.toMatchObject({
        statusCode: 404,
        message: "Función no encontrada",
      });
    });
  });
});
