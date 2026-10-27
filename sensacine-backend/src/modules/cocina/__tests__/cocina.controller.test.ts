import { Response } from "express";
import { AuthRequest } from "../../../common/middlewares/authMiddleware";
import { CocinaController } from "../cocina.controller";
import { CocinaService } from "../cocina.service";

describe("CocinaController (HU-29)", () => {
  let mockService: jest.Mocked<Partial<CocinaService>>;
  let controller: CocinaController;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockService = {
      listarFuncionesProgramadas: jest.fn(),
      obtenerFuncionConReservas: jest.fn(),
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
});
