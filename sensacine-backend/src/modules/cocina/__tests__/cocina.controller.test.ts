import { Response } from "express";
import { AuthRequest } from "../../../common/middlewares/authMiddleware";
import { CocinaController } from "../cocina.controller";
import { CocinaService } from "../cocina.service";

describe("CocinaController (HU-29 y HU Cambio de Estado Orden)", () => {
  let mockService: jest.Mocked<Partial<CocinaService>>;
  let controller: CocinaController;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockService = {
      listarFuncionesProgramadas: jest.fn(),
      obtenerFuncionConReservas: jest.fn(),
      actualizarEstadoOrden: jest.fn(),
      obtenerOrdenPorId: jest.fn(),
    };
    controller = new CocinaController(mockService as CocinaService);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("listarFuncionesProgramadas", () => {
    it("debe retornar 200 con el listado de funciones y total", async () => {
      const mockResult = {
        total: 1,
        funciones: [{ id: 1, pelicula: { titulo: "Dune" } } as any],
      };
      (mockService.listarFuncionesProgramadas as jest.Mock).mockResolvedValue(mockResult);

      const req = {
        query: {},
        usuario: { id: 3, email: "cocina@sensacine.com", rol: "cocina" },
      } as AuthRequest;

      await controller.listarFuncionesProgramadas(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("debe retornar mensaje informativo cuando no hay funciones disponibles", async () => {
      const mockResult = {
        mensaje: "No hay funciones disponibles",
        total: 0,
        funciones: [],
      };
      (mockService.listarFuncionesProgramadas as jest.Mock).mockResolvedValue(mockResult);

      const req = {
        query: {},
        usuario: { id: 3, email: "cocina@sensacine.com", rol: "cocina" },
      } as AuthRequest;

      await controller.listarFuncionesProgramadas(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("debe retornar arreglo plano si se solicita formato=array", async () => {
      const mockFunciones = [{ id: 1, pelicula: { titulo: "Dune" } } as any];
      const mockResult = {
        total: 1,
        funciones: mockFunciones,
      };
      (mockService.listarFuncionesProgramadas as jest.Mock).mockResolvedValue(mockResult);

      const req = {
        query: { formato: "array" },
        usuario: { id: 3, email: "cocina@sensacine.com", rol: "cocina" },
      } as unknown as AuthRequest;

      await controller.listarFuncionesProgramadas(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFunciones);
    });
  });

  describe("obtenerFuncionPorId", () => {
    it("debe responder 400 si el id no es un número positivo", async () => {
      const req = {
        params: { id: "invalido" },
      } as unknown as AuthRequest;

      await controller.obtenerFuncionPorId(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: "El identificador de la función no es válido",
      });
      expect(mockService.obtenerFuncionConReservas).not.toHaveBeenCalled();
    });

    it("debe retornar la función encontrada con status 200", async () => {
      const mockFuncion = { id: 5, pelicula: { titulo: "Avatar" } } as any;
      (mockService.obtenerFuncionConReservas as jest.Mock).mockResolvedValue(mockFuncion);

      const req = {
        params: { id: "5" },
      } as unknown as AuthRequest;

      await controller.obtenerFuncionPorId(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFuncion);
    });
  });

  describe("actualizarEstadoOrden", () => {
    it("debe responder 400 si el id no es un número válido", async () => {
      const req = {
        params: { id: "abc" },
        body: { estado: "En_preparacion" },
      } as unknown as AuthRequest;

      await controller.actualizarEstadoOrden(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: "El identificador de la orden no es válido",
      });
      expect(mockService.actualizarEstadoOrden).not.toHaveBeenCalled();
    });

    it("debe actualizar el estado y retornar 200 con el resultado", async () => {
      const mockResultado = {
        mensaje: "Estado de la orden actualizado exitosamente",
        orden: { id: 8, estado: "En_preparacion" },
      };
      (mockService.actualizarEstadoOrden as jest.Mock).mockResolvedValue(mockResultado);

      const req = {
        params: { id: "8" },
        body: { estado: "En_preparacion" },
      } as unknown as AuthRequest;

      await controller.actualizarEstadoOrden(req, mockResponse as Response);

      expect(mockService.actualizarEstadoOrden).toHaveBeenCalledWith(8, "En_preparacion");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResultado);
    });
  });

  describe("obtenerOrdenPorId", () => {
    it("debe responder 400 si el id es inválido", async () => {
      const req = {
        params: { id: "0" },
      } as unknown as AuthRequest;

      await controller.obtenerOrdenPorId(req, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: "El identificador de la orden no es válido",
      });
      expect(mockService.obtenerOrdenPorId).not.toHaveBeenCalled();
    });

    it("debe retornar 200 con la orden obtenida", async () => {
      const mockOrden = { id: 12, estado: "Lista" };
      (mockService.obtenerOrdenPorId as jest.Mock).mockResolvedValue(mockOrden);

      const req = {
        params: { id: "12" },
      } as unknown as AuthRequest;

      await controller.obtenerOrdenPorId(req, mockResponse as Response);

      expect(mockService.obtenerOrdenPorId).toHaveBeenCalledWith(12);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrden);
    });
  });
});
