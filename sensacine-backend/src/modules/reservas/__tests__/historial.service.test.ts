import { HistorialReservaService } from "../historial.service";
import { HistorialReservaRepository } from "../historial.repository";
import { AppError } from "../../../common/errors/AppError";

describe("HistorialReservaService", () => {
  let mockRepo: jest.Mocked<Partial<HistorialReservaRepository>>;
  let service: HistorialReservaService;

  beforeEach(() => {
    mockRepo = {
      getReservasActivasByUsuario: jest.fn(),
      getHistorialByUsuario: jest.fn(),
      getReservaById: jest.fn(),
    };
    service = new HistorialReservaService(mockRepo as HistorialReservaRepository);
  });

  describe("getReservasActivasByUsuario", () => {
    it("debe retornar la lista de reservas activas del usuario autenticado", async () => {
      const mockReservas = [
        {
          id: 10,
          idUsuario: 2,
          idFuncion: 32,
          montoTotal: 30000,
          estado: "Confirmado",
          funcion: {
            fecha: new Date("2026-10-15T00:00:00.000Z"),
            horaInicio: new Date("1970-01-01T15:00:00.000Z"),
            horaFin: new Date("1970-01-01T17:30:00.000Z"),
            pelicula: { id: 1, titulo: "Dune: Part Two", posterUrl: "poster.jpg", productos: [] },
            sala: { id: 1, nombre: "Sala 1" },
          },
          asientos: [
            { id: 1, asiento: { id: 5, fila: "C", numero: 4 }, restricciones: [] },
          ],
        },
      ];

      (mockRepo.getReservasActivasByUsuario as jest.Mock).mockResolvedValue(mockReservas);

      const result = await service.getReservasActivasByUsuario(2);

      expect(mockRepo.getReservasActivasByUsuario).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockReservas);
      expect(result).toHaveLength(1);
      expect(result[0].estado).toBe("Confirmado");
    });
  });

  describe("getHistorialByUsuario", () => {
    it("debe retornar el historial de reservas pasadas del usuario", async () => {
      const mockHistorial = [
        {
          id: 1,
          idUsuario: 2,
          idFuncion: 1,
          montoTotal: 25000,
          estado: "Confirmado",
          funcion: {
            fecha: new Date("2026-09-21T00:00:00.000Z"),
            horaInicio: new Date("1970-01-01T09:00:00.000Z"),
            horaFin: new Date("1970-01-01T11:20:00.000Z"),
            pelicula: { id: 1, titulo: "Spider-Man", posterUrl: null, productos: [] },
            sala: { id: 1, nombre: "Sala 1" },
          },
          asientos: [],
        },
      ];

      (mockRepo.getHistorialByUsuario as jest.Mock).mockResolvedValue(mockHistorial);

      const result = await service.getHistorialByUsuario(2);

      expect(mockRepo.getHistorialByUsuario).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockHistorial);
    });
  });

  describe("getReservaById", () => {
    it("lanza AppError 404 si la reserva no existe para el usuario", async () => {
      (mockRepo.getReservaById as jest.Mock).mockResolvedValue(null);

      await expect(service.getReservaById(999, 2)).rejects.toThrow(AppError);
    });

    it("retorna la reserva si existe y pertenece al usuario", async () => {
      const mockReserva = { id: 10, idUsuario: 2 } as any;
      (mockRepo.getReservaById as jest.Mock).mockResolvedValue(mockReserva);

      const result = await service.getReservaById(10, 2);

      expect(mockRepo.getReservaById).toHaveBeenCalledWith(10, 2);
      expect(result).toEqual(mockReserva);
    });
  });
});
