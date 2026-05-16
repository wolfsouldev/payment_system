import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

import { TarjetasService } from "./tarjetas.service";
import { CreateTarjetaDto } from "./dto/create-tarjeta.dto";
import { FindTarjetasDto } from "./dto/find-tarjetas.dto";

@ApiTags("Tarjetas")
@Controller("tarjetas")
export class TarjetasController {
  constructor(private readonly tarjetasService: TarjetasService) {}

  @Post()
  @ApiOperation({ summary: "Registrar una nueva tarjeta de crédito" })
  @ApiResponse({ status: 201, description: "Tarjeta registrada exitosamente." })
  @ApiResponse({ status: 400, description: "Datos inválidos." })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  create(@Body() dto: CreateTarjetaDto) {
    return this.tarjetasService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: "Listar todas las tarjetas con filtros y paginación",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de tarjetas con paginación.",
  })
  findAll(@Query() filters: FindTarjetasDto) {
    return this.tarjetasService.findAll(filters);
  }

  @Get("usuario/:usuarioId")
  @ApiOperation({ summary: "Listar tarjetas de un usuario" })
  @ApiParam({ name: "usuarioId", description: "UUID del usuario" })
  @ApiResponse({ status: 200, description: "Tarjetas del usuario." })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  findByUsuario(@Param("usuarioId", ParseUUIDPipe) usuarioId: string) {
    return this.tarjetasService.findByUsuario(usuarioId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una tarjeta por ID" })
  @ApiParam({ name: "id", description: "UUID de la tarjeta" })
  @ApiResponse({ status: 200, description: "Tarjeta encontrada." })
  @ApiResponse({ status: 404, description: "Tarjeta no encontrada." })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.tarjetasService.findOne(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar una tarjeta" })
  @ApiParam({ name: "id", description: "UUID de la tarjeta" })
  @ApiResponse({ status: 200, description: "Tarjeta eliminada." })
  @ApiResponse({ status: 404, description: "Tarjeta no encontrada." })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.tarjetasService.remove(id);
  }
}
