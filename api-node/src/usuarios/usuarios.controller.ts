import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

import { UsuariosService } from "./usuarios.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { FindUsuariosDto } from "./dto/find-usuarios.dto";

@ApiTags("Usuarios")
@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo usuario" })
  @ApiResponse({ status: 201, description: "Usuario creado exitosamente." })
  @ApiResponse({ status: 400, description: "Datos inválidos." })
  @ApiResponse({ status: 409, description: "El email ya está registrado." })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: "Listar todos los usuarios con paginación y filtro",
  })
  @ApiQuery({
    name: "email",
    required: false,
    description: "Filtro por correo electrónico (búsqueda parcial)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Número de página (comienza en 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Cantidad de registros por página",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios con información de paginación.",
  })
  findAll(@Query() dto: FindUsuariosDto) {
    return this.usuariosService.findAll(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un usuario por ID" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200, description: "Usuario encontrado." })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar un usuario" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200, description: "Usuario actualizado." })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar un usuario" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200, description: "Usuario eliminado." })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.usuariosService.remove(id);
  }
}
