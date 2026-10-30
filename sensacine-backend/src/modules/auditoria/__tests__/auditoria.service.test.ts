import { AppError } from "../../../common/errors/AppError";
import { AuditoriaService } from "../auditoria.service";
import { IAuditoriaRepository } from "../auditoria.types";

describe("AuditoriaService", () => {
  let mockRepo: jest.Mocked<IAuditoriaRepository>;
  let service: AuditoriaService;

  beforeEach(() => {
    mockRepo = {
      crear: jest.fn(),
      listar: jest.fn(),
      obtenerPorId: jest.fn(),
    };
    service = new AuditoriaService(mockRepo);
  });

  describe("registrar", () => {
    it("debe registrar un evento de auditoría exitosamente", async () => {
      const mockLog = {
        id: 1,
        idUsuario: 10,
        usuarioEmail: "admin@sensacine.com",
        usuarioRol: "admin",
        accion: "CREAR",
        entidad: "Pelicula",
        entidadId: 5,
        valorAnterior: null,
        valorNuevo: { titulo: "Interestelar" },
        metadata: null,
        fechaHora: new Date(),
      };

      mockRepo.crear.mockResolvedValue(mockLog as any);

      const input = {
        actor: { id: 10, email: "admin@sensacine.com", rol: "admin" },
        accion: "CREAR",
        entidad: "Pelicula",
        entidadId: 5,
        valorAnterior: null,
        valorNuevo: { titulo: "Interestelar" },
      };

      const resultado = await service.registrar(input);

      expect(mockRepo.crear).toHaveBeenCalledWith(input, undefined);
      expect(resultado).toEqual(mockLog);
    });
  });

  describe("listar", () => {
    it("debe retornar la lista paginada de logs con filtros", async () => {
      const mockRespuesta = {
        total: 1,
        paginas: 1,
        pagina: 1,
        limite: 20,
        logs: [
          {
            id: 1,
            idUsuario: 10,
            usuarioEmail: "admin@sensacine.com",
            usuarioRol: "admin",
            usuarioNombre: "Admin",
            accion: "CREAR",
            entidad: "Pelicula",
            entidadId: 5,
            valorAnterior: null,
            valorNuevo: { titulo: "Interestelar" },
            metadata: null,
            fechaHora: new Date(),
          },
        ],
      };

      mockRepo.listar.mockResolvedValue(mockRespuesta);

      const filtros = { entidad: "Pelicula", pagina: 1, limite: 20 };
      const resultado = await service.listar(filtros);

      expect(mockRepo.listar).toHaveBeenCalledWith(filtros);
      expect(resultado.total).toBe(1);
      expect(resultado.logs).toHaveLength(1);
    });
  });

  describe("obtenerPorId", () => {
    it("debe lanzar 400 si el ID no es válido", async () => {
      await expect(service.obtenerPorId(0)).rejects.toThrow(AppError);
      await expect(service.obtenerPorId(-1)).rejects.toThrow(AppError);
      await expect(service.obtenerPorId(1.5 as any)).rejects.toThrow(AppError);
    });

    it("debe lanzar 404 si el log no existe", async () => {
      mockRepo.obtenerPorId.mockResolvedValue(null);

      await expect(service.obtenerPorId(999)).rejects.toThrow("Registro de auditoría no encontrado");
    });

    it("debe retornar el log si existe", async () => {
      const mockLog = {
        id: 1,
        idUsuario: 10,
        usuarioEmail: "admin@sensacine.com",
        usuarioRol: "admin",
        usuarioNombre: "Admin",
        accion: "CREAR",
        entidad: "Pelicula",
        entidadId: 5,
        valorAnterior: null,
        valorNuevo: { titulo: "Interestelar" },
        metadata: null,
        fechaHora: new Date(),
      };

      mockRepo.obtenerPorId.mockResolvedValue(mockLog);

      const resultado = await service.obtenerPorId(1);
      expect(resultado).toEqual(mockLog);
      expect(mockRepo.obtenerPorId).toHaveBeenCalledWith(1);
    });
  });
});

