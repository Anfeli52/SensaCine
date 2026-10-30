import { EstadoOrdenCocina } from "@prisma/client";
import { CocinaService } from "../cocina.service";
import { FuncionCocina, ICocinaRepository, ReservaCocina } from "../cocina.types";

const asFunciones = (data: unknown) => data as FuncionCocina[];
const asReservas = (data: unknown) => data as ReservaCocina[];

describe("CocinaService (HU-29 y HU Cambio de Estado Orden)", () => {
  let mockRepo: jest.Mocked<ICocinaRepository>;
  let service: CocinaService;

  beforeEach(() => {
    mockRepo = {
      getFuncionesFuturas: jest.fn(),
      getReservasPorFuncion: jest.fn(),
      getReservasPorFunciones: jest.fn(),
      actualizarEstadoOrden: jest.fn(),
      obtenerOrdenPorId: jest.fn(),
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

  describe("actualizarEstadoOrden", () => {
    it("debe actualizar el estado de una orden a 'En_preparacion' exitosamente", async () => {
      const mockOrdenActualizada = {
        id: 10,
        idReservaAsiento: 5,
        estado: EstadoOrdenCocina.En_preparacion,
        fechaActualizacion: new Date(),
      };

      mockRepo.actualizarEstadoOrden.mockResolvedValue(mockOrdenActualizada);

      const resultado = await service.actualizarEstadoOrden(10, EstadoOrdenCocina.En_preparacion);

      expect(mockRepo.actualizarEstadoOrden).toHaveBeenCalledWith(10, EstadoOrdenCocina.En_preparacion);
      expect(resultado).toEqual({
        mensaje: "Estado de la orden actualizado exitosamente",
        orden: mockOrdenActualizada,
      });
    });

    it("debe actualizar el estado de una orden a 'Lista' exitosamente", async () => {
      const mockOrdenActualizada = {
        id: 10,
        idReservaAsiento: 5,
        estado: EstadoOrdenCocina.Lista,
        fechaActualizacion: new Date(),
      };

      mockRepo.actualizarEstadoOrden.mockResolvedValue(mockOrdenActualizada);

      const resultado = await service.actualizarEstadoOrden(10, EstadoOrdenCocina.Lista);

      expect(mockRepo.actualizarEstadoOrden).toHaveBeenCalledWith(10, EstadoOrdenCocina.Lista);
      expect(resultado.orden.estado).toBe(EstadoOrdenCocina.Lista);
    });

    it("debe actualizar el estado de una orden a 'Pendiente' exitosamente", async () => {
      const mockOrdenActualizada = {
        id: 10,
        idReservaAsiento: 5,
        estado: EstadoOrdenCocina.Pendiente,
        fechaActualizacion: new Date(),
      };

      mockRepo.actualizarEstadoOrden.mockResolvedValue(mockOrdenActualizada);

      const resultado = await service.actualizarEstadoOrden(10, EstadoOrdenCocina.Pendiente);

      expect(mockRepo.actualizarEstadoOrden).toHaveBeenCalledWith(10, EstadoOrdenCocina.Pendiente);
      expect(resultado.orden.estado).toBe(EstadoOrdenCocina.Pendiente);
    });
    it("debe registrar log de auditoria cuando se provee actor y auditoriaService", async () => {
      const mockAuditoria = {
        registrar: jest.fn().mockResolvedValue({} as any),
      };
      const serviceConAuditoria = new CocinaService(mockRepo, mockAuditoria as any);

      mockRepo.obtenerOrdenConReserva = jest.fn().mockResolvedValue({
        id: 10,
        idReservaAsiento: 5,
        estado: EstadoOrdenCocina.Pendiente,
        fechaActualizacion: new Date(),
        reservaAsiento: { id: 5, idReserva: 45 },
      });

      mockRepo.actualizarEstadoOrden.mockResolvedValue({
        id: 10,
        idReservaAsiento: 5,
        estado: EstadoOrdenCocina.En_preparacion,
        fechaActualizacion: new Date(),
      });

      const actor = { id: 8, email: "chef@sensacine.com", rol: "cocina" };
      const resultado = await serviceConAuditoria.actualizarEstadoOrden(
        10,
        EstadoOrdenCocina.En_preparacion,
        actor
      );

      expect(resultado.orden.estado).toBe(EstadoOrdenCocina.En_preparacion);
      expect(mockAuditoria.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          actor,
          accion: "CAMBIO_ESTADO",
          entidad: "OrdenCocina",
          entidadId: 10,
        }),
        expect.anything()
      );

    });

    it("debe lanzar 400 si el identificador no es válido", async () => {
      await expect(service.actualizarEstadoOrden(0, EstadoOrdenCocina.En_preparacion)).rejects.toMatchObject({
        statusCode: 400,
        message: "El identificador de la orden no es válido",
      });

      await expect(service.actualizarEstadoOrden(-5, EstadoOrdenCocina.En_preparacion)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("debe lanzar 400 si el estado no es uno de los permitidos", async () => {
      await expect(service.actualizarEstadoOrden(10, "Cancelado" as any)).rejects.toMatchObject({
        statusCode: 400,
        message: "Estado no válido. Los estados permitidos son: Pendiente, En preparación y Lista",
      });
    });

    it("debe lanzar 404 si la orden no existe", async () => {
      mockRepo.actualizarEstadoOrden.mockResolvedValue(null);

      await expect(service.actualizarEstadoOrden(999, EstadoOrdenCocina.Lista)).rejects.toMatchObject({
        statusCode: 404,
        message: "Orden de cocina no encontrada",
      });
    });
  });

  describe("obtenerOrdenPorId", () => {
    it("debe retornar la orden si existe", async () => {
      const mockOrden = {
        id: 10,
        idReservaAsiento: 5,
        estado: EstadoOrdenCocina.Pendiente,
        fechaActualizacion: new Date(),
      };
      mockRepo.obtenerOrdenPorId.mockResolvedValue(mockOrden);

      const resultado = await service.obtenerOrdenPorId(10);
      expect(resultado).toEqual(mockOrden);
      expect(mockRepo.obtenerOrdenPorId).toHaveBeenCalledWith(10);
    });

    it("debe lanzar 404 si la orden no existe", async () => {
      mockRepo.obtenerOrdenPorId.mockResolvedValue(null);

      await expect(service.obtenerOrdenPorId(999)).rejects.toMatchObject({
        statusCode: 404,
        message: "Orden de cocina no encontrada",
      });
    });

    it("debe lanzar 400 si el ID es inválido", async () => {
      await expect(service.obtenerOrdenPorId(-1)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });
});
