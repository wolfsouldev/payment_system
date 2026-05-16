import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TarjetaTipo, TarjetaMarca } from '../enums/tarjeta.enum';

export class FindTarjetasDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activa?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de tarjeta',
    enum: ['credito', 'debito'],
  })
  @IsOptional()
  @IsEnum(TarjetaTipo)
  tipo?: TarjetaTipo;

  @ApiPropertyOptional({
    description: 'Filtrar por marca de tarjeta',
    enum: ['visa', 'mastercard', 'amex'],
  })
  @IsOptional()
  @IsEnum(TarjetaMarca)
  marca?: TarjetaMarca;

  @ApiPropertyOptional({ description: 'Buscar por número de tarjeta (búsqueda parcial)' })
  @IsOptional()
  @IsString()
  numeroTarjeta?: string;
}
