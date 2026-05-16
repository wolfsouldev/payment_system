import { Module } from '@nestjs/common';

import { UsuariosModule } from '../usuarios/usuarios.module';
import { TarjetasController } from './tarjetas.controller';
import { TarjetasService } from './tarjetas.service';

@Module({
  imports: [UsuariosModule],
  controllers: [TarjetasController],
  providers: [TarjetasService],
  exports: [TarjetasService],
})
export class TarjetasModule {}
