import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreatePagoDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que realiza el pago',
  })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID de la tarjeta con la que se realiza el pago',
  })
  @IsUUID()
  @IsNotEmpty()
  tarjetaId: string;

  @ApiProperty({ example: 1500.0, description: 'Monto del pago (debe ser mayor a 0)' })
  @IsNumber()
  @Min(0.01)
  monto: number;

  @ApiPropertyOptional({ example: 'MXN', description: 'Código de moneda ISO 4217' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  moneda?: string;

  @ApiPropertyOptional({ example: 'Compra en línea', description: 'Descripción del pago' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
