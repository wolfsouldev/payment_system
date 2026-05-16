import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PagoEstado, PagoMoneda } from '../enums/pago.enum';

export class FindPagosDto {
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

  @ApiPropertyOptional({
    description: 'Filtrar por estado del pago',
    enum: ['pendiente', 'aprobado', 'rechazado'],
  })
  @IsOptional()
  @IsEnum(PagoEstado)
  estado?: PagoEstado;

  @ApiPropertyOptional({
    description: 'Filtrar por moneda',
    enum: ['MXN', 'USD', 'EUR'],
  })
  @IsOptional()
  @IsEnum(PagoMoneda)
  moneda?: PagoMoneda;

  @ApiPropertyOptional({ description: 'Filtrar por ID de tarjeta' })
  @IsOptional()
  @IsString()
  tarjetaId?: string;
}
