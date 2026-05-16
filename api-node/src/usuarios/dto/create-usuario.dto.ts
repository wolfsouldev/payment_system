import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Carlos', description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'García', description: 'Apellido del usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @ApiProperty({ example: 'carlos.garcia@email.com', description: 'Email único del usuario' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678', description: 'Teléfono del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}
