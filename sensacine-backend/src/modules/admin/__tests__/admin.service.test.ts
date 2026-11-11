import { Rol } from "@prisma/client";
import { AdminService } from "../admin.service";
import { IAdminRepository } from "../admin.repository";
import { IAuditoriaService } from "../../auditoria/auditoria.types";
import { AppError } from "../../../common/errors/AppError";

const mockLogAuditoria = {
  id: 1,
  idUsuario: 1,
  usuarioEmail: "admin@sensacine.com",
  usuarioRol: "admin",
  accion: "EDITAR_ROL",
  entidad: "Usuario",
  entidadId: 1,
  valorAnterior: null,
  valorNuevo: null,
  metadata: null,
  fechaHora: new Date(),
};

const usuario = {
  id: 1,
  nombre: "Ana",
  email: "ana@test.com",
  rol: Rol.cliente,
  estado: "activo",
  fechaRegistro: new Date("2026-01-01"),
  passwordHash: "secreto",
};
const dto = {
  id: 1,
  nombre: "Ana",
  email: "ana@test.com",
  rol: Rol.cliente,
  estado: "activo",
  fechaRegistro: usuario.fechaRegistro,
};

describe("AdminService", () => {
  let repo: jest.Mocked<IAdminRepository>;
  let mockAuditoria: IAuditoriaService;
  let service: AdminService;
  let serviceConAuditoria: AdminService;

  const actor = {
    id: 99,
    email: "admin@sensacine.com",
    rol: "admin",
  };

  beforeEach(() => {
    repo = {
      obtenerUsuarios: jest.fn(),
      actualizarRol: jest.fn(),
      actualizarEstado: jest.fn(),
      obtenerPorId: jest.fn().mockResolvedValue(usuario),
    };
    mockAuditoria = {
      registrar: jest.fn().mockResolvedValue(mockLogAuditoria),
    };

    service = new AdminService(repo);
    serviceConAuditoria = new AdminService(repo, mockAuditoria);
  });

  it("obtenerUsuarios nunca expone el passwordHash", async () => {
    (repo.obtenerUsuarios as jest.Mock).mockResolvedValue([usuario]);
    const res = await service.obtenerUsuarios();
    expect(res).toEqual([dto]);
    expect(res[0]).not.toHaveProperty("passwordHash");
  });

  it("actualizarRol devuelve el usuario como DTO sin auditoria", async () => {
    (repo.actualizarRol as jest.Mock).mockResolvedValue(usuario);
    expect(await service.actualizarRol(1, Rol.admin)).toEqual(dto);
    expect(repo.actualizarRol).toHaveBeenCalledWith(1, Rol.admin);
  });

  it("actualizarRol registra auditoria cuando hay actor y auditoriaService", async () => {
    (repo.actualizarRol as jest.Mock).mockResolvedValue({ ...usuario, rol: Rol.cocina });
    const res = await serviceConAuditoria.actualizarRol(1, Rol.cocina, actor);

    expect(res.rol).toBe(Rol.cocina);
    expect(mockAuditoria.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        actor,
        accion: "EDITAR_ROL",
        entidad: "Usuario",
        entidadId: 1,
      }),
      expect.anything()
    );
  });

  it("actualizarRol lanza 404 si el usuario no existe", async () => {
    (repo.obtenerPorId as jest.Mock).mockResolvedValue(null);
    await expect(service.actualizarRol(999, Rol.admin)).rejects.toThrow(AppError);
  });

  it("actualizarEstado devuelve el usuario como DTO sin auditoria", async () => {
    (repo.actualizarEstado as jest.Mock).mockResolvedValue(usuario);
    expect(await service.actualizarEstado(1, "inactivo")).toEqual(dto);
  });

  it("actualizarEstado registra auditoria con accion DESACTIVAR", async () => {
    (repo.actualizarEstado as jest.Mock).mockResolvedValue({ ...usuario, estado: "inactivo" });
    const res = await serviceConAuditoria.actualizarEstado(1, "inactivo", actor);

    expect(res.estado).toBe("inactivo");
    expect(mockAuditoria.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        actor,
        accion: "DESACTIVAR",
        entidad: "Usuario",
        entidadId: 1,
      }),
      expect.anything()
    );
  });

  it("actualizarEstado registra auditoria con accion ACTIVAR", async () => {
    (repo.actualizarEstado as jest.Mock).mockResolvedValue({ ...usuario, estado: "activo" });
    const res = await serviceConAuditoria.actualizarEstado(1, "activo", actor);

    expect(res.estado).toBe("activo");
    expect(mockAuditoria.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        actor,
        accion: "ACTIVAR",
        entidad: "Usuario",
        entidadId: 1,
      }),
      expect.anything()
    );
  });

  it("actualizarEstado lanza 404 si el usuario no existe", async () => {
    (repo.obtenerPorId as jest.Mock).mockResolvedValue(null);
    await expect(service.actualizarEstado(999, "activo")).rejects.toThrow(AppError);
  });
});
