import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { eq, like, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { DRIZZLE } from "../database/drizzle.provider";
import * as schema from "../database/schema";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { FindUsuariosDto } from "./dto/find-usuarios.dto";

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(dto: CreateUsuarioDto) {
    try {
      const [usuario] = await this.db
        .insert(schema.usuarios)
        .values(dto)
        .returning();

      return usuario;
    } catch (error) {
      // Código 23505: unique_violation en PostgreSQL
      if (error?.code === "23505") {
        throw new ConflictException(
          `Ya existe un usuario con el email: ${dto.email}`,
        );
      }
      this.logger.error(
        `Error al crear usuario`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async findAll(dto: FindUsuariosDto) {
    try {
      const { email, page = 1, limit = 10 } = dto;
      const offset = (page - 1) * limit;

      const whereClause = email
        ? like(schema.usuarios.email, `%${email}%`)
        : undefined;

      const [usuarios, [{ total }]] = await Promise.all([
        this.db
          .select()
          .from(schema.usuarios)
          .where(whereClause)
          .orderBy(schema.usuarios.createdAt)
          .limit(limit)
          .offset(offset),

        this.db
          .select({ total: count() })
          .from(schema.usuarios)
          .where(whereClause),
      ]);

      return {
        data: usuarios,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener todos los usuarios`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const [usuario] = await this.db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.id, id))
        .limit(1);

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return usuario;
    } catch (error) {
      this.logger.error(
        `Error al buscar usuario con ID ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    try {
      const usuarioActual = await this.findOne(id);

      if (dto.email && dto.email !== usuarioActual.email) {
        const existente = await this.db
          .select()
          .from(schema.usuarios)
          .where(eq(schema.usuarios.email, dto.email))
          .limit(1);

        if (existente.length > 0) {
          throw new ConflictException(
            `Ya existe un usuario con el email: ${dto.email}`,
          );
        }
      }

      const [usuario] = await this.db
        .update(schema.usuarios)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(schema.usuarios.id, id))
        .returning();

      return usuario;
    } catch (error) {
      this.logger.error(
        `Error al actualizar usuario con ID ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.db
        .delete(schema.usuarios)
        .where(eq(schema.usuarios.id, id));

      return { message: `Usuario con ID ${id} eliminado correctamente` };
    } catch (error) {
      this.logger.error(
        `Error al eliminar usuario con ID ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}