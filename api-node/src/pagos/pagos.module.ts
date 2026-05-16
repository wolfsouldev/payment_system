import { Module } from '@nestjs/common';

import { UsuariosModule } from '../usuarios/usuarios.module';
import { TarjetasModule } from '../tarjetas/tarjetas.module';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [UsuariosModule, TarjetasModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
