import { LogAuditoria, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";
import {
  AuditoriaItemResponse,
  AuditoriaPaginadaResponse,
  DbClient,
  FiltrosAuditoriaInput,
  IAuditoriaRepository,
  RegistrarAuditoriaInput,
} from "./auditoria.types";

function toJsonValue(
  val: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (val === undefined) return undefined;
  if (val === null) return Prisma.JsonNull;
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return String(val);
  }
}

export class AuditoriaRepository implements IAuditoriaRepository {
  async crear(data: RegistrarAuditoriaInput, tx?: DbClient): Promise<LogAuditoria> {
    const client = tx ?? prisma;

    return client.logAuditoria.create({
      data: {
        idUsuario: data.actor?.id ?? null,
        usuarioEmail: data.actor?.email ?? null,
        usuarioRol: data.actor?.rol ?? null,
        accion: data.accion,
        entidad: data.entidad,
        entidadId: data.entidadId,
        valorAnterior: toJsonValue(data.valorAnterior),
        valorNuevo: toJsonValue(data.valorNuevo),
        metadata: toJsonValue(data.metadata),
      },
    });
  }

  async listar(filtros: FiltrosAuditoriaInput): Promise<AuditoriaPaginadaResponse> {
    const where: Prisma.LogAuditoriaWhereInput = {};

    if (filtros.entidad) {
      where.entidad = { equals: filtros.entidad, mode: "insensitive" };
    }

    if (filtros.entidadId) {
      where.entidadId = filtros.entidadId;
    }

    if (filtros.idUsuario) {
      where.idUsuario = filtros.idUsuario;
    }

    if (filtros.accion) {
      where.accion = { equals: filtros.accion, mode: "insensitive" };
    }

    if (filtros.desde || filtros.hasta) {
      where.fechaHora = {
        gte: filtros.desde ? new Date(filtros.desde) : undefined,
        lte: filtros.hasta ? new Date(filtros.hasta) : undefined,
      };
    }

    const pagina = Math.max(1, filtros.pagina ?? 1);
    const limite = Math.min(100, Math.max(1, filtros.limite ?? 20));
    const skip = (pagina - 1) * limite;

    const [total, items] = await Promise.all([
      prisma.logAuditoria.count({ where }),
      prisma.logAuditoria.findMany({
        where,
        include: {
          usuario: {
            select: {
              nombre: true,
            },
          },
        },
        orderBy: {
          fechaHora: "desc",
        },
        skip,
        take: limite,
      }),
    ]);

    const logs: AuditoriaItemResponse[] = items.map((item) => ({
      id: item.id,
      idUsuario: item.idUsuario,
      usuarioEmail: item.usuarioEmail,
      usuarioRol: item.usuarioRol,
      usuarioNombre: item.usuario?.nombre ?? null,
      accion: item.accion,
      entidad: item.entidad,
      entidadId: item.entidadId,
      valorAnterior: item.valorAnterior,
      valorNuevo: item.valorNuevo,
      metadata: item.metadata,
      fechaHora: item.fechaHora,
    }));

    return {
      total,
      paginas: Math.ceil(total / limite) || 1,
      pagina,
      limite,
      logs,
    };
  }

  async obtenerPorId(id: number): Promise<AuditoriaItemResponse | null> {
    const item = await prisma.logAuditoria.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!item) return null;

    return {
      id: item.id,
      idUsuario: item.idUsuario,
      usuarioEmail: item.usuarioEmail,
      usuarioRol: item.usuarioRol,
      usuarioNombre: item.usuario?.nombre ?? null,
      accion: item.accion,
      entidad: item.entidad,
      entidadId: item.entidadId,
      valorAnterior: item.valorAnterior,
      valorNuevo: item.valorNuevo,
      metadata: item.metadata,
      fechaHora: item.fechaHora,
    };
  }
}
