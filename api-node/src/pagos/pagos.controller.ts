import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { PagosService } from "./pagos.service";
import { CreatePagoDto } from "./dto/create-pago.dto";
import { FindPagosDto } from "./dto/find-pagos.dto";

@ApiTags("Pagos")
@Controller("pagos")
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiOperation({
    summary: "Crear un nuevo pago",
    description:
      "Crea un pago asociado a un usuario y tarjeta. El pago se procesa a través del servicio Python (80% aprobado / 20% rechazado).",
  })
  @ApiResponse({ status: 201, description: "Pago creado y procesado." })
  @ApiResponse({ status: 400, description: "Datos inválidos." })
  @ApiResponse({
    status: 404,
    description: "Usuario o tarjeta no encontrados.",
  })
  @ApiResponse({
    status: 502,
    description: "Error al conectar con el servicio de procesamiento.",
  })
  create(@Body() dto: CreatePagoDto) {
    return this.pagosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los pagos con filtros y paginación" })
  @ApiResponse({ status: 200, description: "Lista de pagos con paginación." })
  findAll(@Query() filters: FindPagosDto) {
    return this.pagosService.findAll(filters);
  }

  @Get("usuario/:usuarioId")
  @ApiOperation({
    summary: "Listar historial de pagos de un usuario con filtros y paginación",
  })
  @ApiParam({ name: "usuarioId", description: "UUID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Historial de pagos del usuario con paginación.",
  })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  findByUsuario(
    @Param("usuarioId", ParseUUIDPipe) usuarioId: string,
    @Query() filters: FindPagosDto,
  ) {
    return this.pagosService.findByUsuario(usuarioId, filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un pago por ID" })
  @ApiParam({ name: "id", description: "UUID del pago" })
  @ApiResponse({ status: 200, description: "Pago encontrado." })
  @ApiResponse({ status: 404, description: "Pago no encontrado." })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.pagosService.findOne(id);
  }
}
