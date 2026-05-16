import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsIn,
  IsBoolean,
  MaxLength,
  Matches,
  IsEnum,
} from "class-validator";
import { TarjetaTipo, TarjetaMarca } from "../enums/tarjeta.enum";

export class CreateTarjetaDto {
  @ApiProperty({
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    description: "UUID del usuario propietario",
  })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({
    example: "4111-1111-1111-1111",
    description: "Número de tarjeta (formato: XXXX-XXXX-XXXX-XXXX)",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(19)
  @Matches(/^\d{4}-\d{4}-\d{4}-\d{3,4}$/, {
    message: "El número de tarjeta debe tener formato XXXX-XXXX-XXXX-XXXX",
  })
  numeroTarjeta: string;

  @ApiProperty({
    example: "CARLOS GARCIA",
    description: "Nombre del titular de la tarjeta",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titular: string;

  @ApiProperty({
    example: "12/28",
    description: "Fecha de expiración (formato: MM/YY)",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "La fecha de expiración debe tener formato MM/YY",
  })
  fechaExpiracion: string;

  @ApiPropertyOptional({
    example: "credito",
    description: "Tipo de tarjeta",
    enum: ["credito", "debito"],
  })
  @IsOptional()
  @IsEnum(TarjetaTipo)
  tipo?: TarjetaTipo;

  @ApiPropertyOptional({
    example: "visa",
    description: "Marca de la tarjeta",
    enum: ["visa", "mastercard", "amex"],
  })
  @IsOptional()
  @IsEnum(TarjetaMarca)
  marca?: TarjetaMarca;

  @ApiPropertyOptional({ example: true, description: "Estado de la tarjeta" })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @ApiPropertyOptional({
    example: "4111111111111111,12/28,123",
    description: "Datos de la tarjeta en formato CSV",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  csv?: string;
}
