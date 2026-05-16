import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { eq, and, like, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { DRIZZLE } from "../database/drizzle.provider";
import * as schema from "../database/schema";
import { UsuariosService } from "../usuarios/usuarios.service";
import { CreateTarjetaDto } from "./dto/create-tarjeta.dto";
import { FindTarjetasDto } from "./dto/find-tarjetas.dto";
import { TarjetaTipo, TarjetaMarca } from "./enums/tarjeta.enum";

@Injectable()
export class TarjetasService {
  private readonly logger = new Logger(TarjetasService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(dto: CreateTarjetaDto) {
    await this.usuariosService.findOne(dto.usuarioId);

    try {
      const [tarjeta] = await this.db
        .insert(schema.tarjetas)
        .values({
          usuarioId: dto.usuarioId,
          numeroTarjeta: dto.numeroTarjeta,
          titular: dto.titular,
          fechaExpiracion: dto.fechaExpiracion,
          tipo: dto.tipo ?? TarjetaTipo.CREDITO,
          marca: dto.marca ?? TarjetaMarca.VISA,
          activa: dto.activa ?? true,
          csv: dto.csv,
        })
        .returning();

      return tarjeta;
    } catch (error) {
      // Código 23505: unique_violation en PostgreSQL
      if (error?.code === "23505") {
        throw new ConflictException(
          `Ya existe una tarjeta con el número ${dto.numeroTarjeta} para este usuario`,
        );
      }
      this.logger.error(
        `Error al crear tarjeta para usuario ${dto.usuarioId}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async findAll(filters: FindTarjetasDto) {
    try {
      const { page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      const whereClause = this.buildWhereClause(filters);

      const [tarjetas, [{ total }]] = await Promise.all([
        this.db
          .select()
          .from(schema.tarjetas)
          .where(whereClause)
          .orderBy(schema.tarjetas.createdAt)
          .limit(limit)
          .offset(offset),
        this.db
          .select({ total: count() })
          .from(schema.tarjetas)
          .where(whereClause),
      ]);

      return {
        data: tarjetas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al buscar tarjetas`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async findByUsuario(usuarioId: string) {
    try {
      await this.usuariosService.findOne(usuarioId);

      const tarjetas = await this.db
        .select()
        .from(schema.tarjetas)
        .where(eq(schema.tarjetas.usuarioId, usuarioId))
        .orderBy(schema.tarjetas.createdAt);

      return tarjetas;
    } catch (error) {
      this.logger.error(
        `Error al buscar tarjetas del usuario ${usuarioId}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    const [tarjeta] = await this.db
      .select()
      .from(schema.tarjetas)
      .where(eq(schema.tarjetas.id, id))
      .limit(1);

    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }

    return tarjeta;
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.db.delete(schema.tarjetas).where(eq(schema.tarjetas.id, id));

      return { message: `Tarjeta con ID ${id} eliminada correctamente` };
    } catch (error) {
      this.logger.error(
        `Error al eliminar tarjeta con ID ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private buildWhereClause(filters: FindTarjetasDto) {
    const conditions = [];

    if (filters.activa !== undefined) {
      conditions.push(eq(schema.tarjetas.activa, filters.activa));
    }

    if (filters.usuarioId) {
      conditions.push(eq(schema.tarjetas.usuarioId, filters.usuarioId));
    }

    if (filters.tipo) {
      conditions.push(eq(schema.tarjetas.tipo, filters.tipo));
    }

    if (filters.marca) {
      conditions.push(eq(schema.tarjetas.marca, filters.marca));
    }

    if (filters.numeroTarjeta) {
      conditions.push(
        like(schema.tarjetas.numeroTarjeta, `%${filters.numeroTarjeta}%`),
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
