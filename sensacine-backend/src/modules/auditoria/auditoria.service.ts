import { AppError } from "../../common/errors/AppError";
import {
  AuditoriaItemResponse,
  AuditoriaPaginadaResponse,
  DbClient,
  FiltrosAuditoriaInput,
  IAuditoriaRepository,
  IAuditoriaService,
  RegistrarAuditoriaInput,
} from "./auditoria.types";

export class AuditoriaService implements IAuditoriaService {
  constructor(private readonly auditoriaRepo: IAuditoriaRepository) {}

  async registrar(data: RegistrarAuditoriaInput, tx?: DbClient) {
    return this.auditoriaRepo.crear(data, tx);
  }

  async listar(filtros: FiltrosAuditoriaInput): Promise<AuditoriaPaginadaResponse> {
    return this.auditoriaRepo.listar(filtros);
  }

  async obtenerPorId(id: number): Promise<AuditoriaItemResponse> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("El identificador del log no es válido", 400);
    }

    const log = await this.auditoriaRepo.obtenerPorId(id);
    if (!log) {
      throw new AppError("Registro de auditoría no encontrado", 404);
    }

    return log;
  }
}

