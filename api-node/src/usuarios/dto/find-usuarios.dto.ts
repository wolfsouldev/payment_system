import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class FindUsuariosDto {
  @ApiPropertyOptional({
    description: "Filtro por correo electrónico (búsqueda parcial)",
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: "Número de página (comienza en 1)",
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de registros por página",
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
