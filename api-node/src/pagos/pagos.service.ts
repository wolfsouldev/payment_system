import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadGatewayException,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { eq, desc, and, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { DRIZZLE } from "../database/drizzle.provider";
import * as schema from "../database/schema";
import { UsuariosService } from "../usuarios/usuarios.service";
import { TarjetasService } from "../tarjetas/tarjetas.service";
import { CreatePagoDto } from "./dto/create-pago.dto";
import { FindPagosDto } from "./dto/find-pagos.dto";
import { envConfig } from "../config/env.config";

// Tiempo máximo de espera al servicio de pagos (ms)
const PAYMENT_SERVICE_TIMEOUT_MS = 5000;
@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private readonly pythonServiceUrl: string;

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly usuariosService: UsuariosService,
    private readonly tarjetasService: TarjetasService,
  ) {
    this.pythonServiceUrl = envConfig.pythonServiceUrl;
  }

  async create(dto: CreatePagoDto) {
    await this.usuariosService.findOne(dto.usuarioId);
    const tarjeta = await this.tarjetasService.findOne(dto.tarjetaId);

    if (tarjeta.usuarioId !== dto.usuarioId) {
      throw new ForbiddenException(
        "La tarjeta no pertenece al usuario especificado",
      );
    }

    let resultado: { aprobado: boolean; estado: string; referencia: string };

    // AbortController permite cancelar el fetch si supera el timeout
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      PAYMENT_SERVICE_TIMEOUT_MS,
    );

    try {
      const response = await fetch(`${this.pythonServiceUrl}/procesar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto: dto.monto,
          moneda: dto.moneda || "MXN",
          descripcion: dto.descripcion,
        }),
        signal: controller.signal, // vincula el abort al fetch
      });

      if (!response.ok) {
        this.logger.error(
          `El servicio de pagos respondió con error HTTP ${response.status}`,
        );
        throw new BadGatewayException(
          "El servicio de pagos respondió con un error inesperado",
        );
      }

      resultado = await response.json();
    } catch (error) {
      // AbortError significa que el fetch fue cancelado por timeout
      if (error?.name === "AbortError") {
        this.logger.error(
          `El servicio de pagos no respondió en ${PAYMENT_SERVICE_TIMEOUT_MS}ms`,
        );
        throw new ServiceUnavailableException(
          "El servicio de pagos no está disponible en este momento. Intenta más tarde.",
        );
      }

      // Si el error ya es una excepción HTTP controlada
      if (
        error instanceof BadGatewayException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      // Error de red u otro error inesperado
      this.logger.error(
        "Error inesperado al conectar con el servicio de pagos",
        error instanceof Error ? error.stack : error,
      );
      throw new BadGatewayException(
        "No se pudo conectar con el servicio de procesamiento de pagos",
      );
    } finally {
      // Siempre limpiar el timeout para no dejar timers huérfanos
      clearTimeout(timeout);
    }

    // En este punto el servicio respondió OK, se puede registrar el pago
    try {
      const [pago] = await this.db
        .insert(schema.pagos)
        .values({
          usuarioId: dto.usuarioId,
          tarjetaId: dto.tarjetaId,
          monto: dto.monto.toFixed(2),
          moneda: dto.moneda || "MXN",
          descripcion: dto.descripcion,
          estado: resultado.estado,
          referencia: resultado.referencia,
        })
        .returning();

      return {
        ...pago,
        procesamiento: {
          aprobado: resultado.aprobado,
          estado: resultado.estado,
          referencia: resultado.referencia,
        },
      };
    } catch (error) {
      // CRÍTICO: el pago fue procesado por el servicio externo pero no se pudo registrar en DB.
      // La referencia externa permite reconciliación manual.
      this.logger.error(
        `PAGO PROCESADO SIN REGISTRAR — referencia externa: ${resultado.referencia}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        "El pago fue procesado pero no pudo registrarse. Contacta a soporte con tu referencia.",
      );
    }
  }

  async findAll(filters: FindPagosDto) {
    const { page = 1, limit = 10, estado, moneda, tarjetaId } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (estado) {
      conditions.push(eq(schema.pagos.estado, estado));
    }

    if (moneda) {
      conditions.push(eq(schema.pagos.moneda, moneda));
    }

    if (tarjetaId) {
      conditions.push(eq(schema.pagos.tarjetaId, tarjetaId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [pagos, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(schema.pagos)
        .where(whereClause)
        .orderBy(desc(schema.pagos.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.pagos).where(whereClause),
    ]);

    return {
      data: pagos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUsuario(usuarioId: string, filters: FindPagosDto) {
    await this.usuariosService.findOne(usuarioId);

    const { page = 1, limit = 10, estado, moneda, tarjetaId } = filters;
    const offset = (page - 1) * limit;

    // usuarioId siempre presente como condición base
    const conditions = [eq(schema.pagos.usuarioId, usuarioId)];

    if (estado) {
      conditions.push(eq(schema.pagos.estado, estado));
    }

    if (moneda) {
      conditions.push(eq(schema.pagos.moneda, moneda));
    }

    if (tarjetaId) {
      conditions.push(eq(schema.pagos.tarjetaId, tarjetaId));
    }

    const whereClause = and(...conditions);

    const [pagos, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(schema.pagos)
        .where(whereClause)
        .orderBy(desc(schema.pagos.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.pagos).where(whereClause),
    ]);

    return {
      data: pagos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const [pago] = await this.db
      .select()
      .from(schema.pagos)
      .where(eq(schema.pagos.id, id))
      .limit(1);

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }
}
