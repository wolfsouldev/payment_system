import { Module } from "@nestjs/common";

import { DatabaseModule } from "./database/database.module";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { TarjetasModule } from "./tarjetas/tarjetas.module";
import { PagosModule } from "./pagos/pagos.module";

@Module({
  imports: [DatabaseModule, UsuariosModule, TarjetasModule, PagosModule],
})
export class AppModule {}
