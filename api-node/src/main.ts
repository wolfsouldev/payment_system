import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { envConfig } from "./config/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("API Sistema de Pagos")
    .setDescription(
      "API RESTful para el sistema de pagos. Permite gestionar usuarios, tarjetas de crédito y pagos.",
    )
    .setVersion("1.0.0")
    .addTag("Usuarios", "Gestión de usuarios")
    .addTag("Tarjetas", "Gestión de tarjetas de crédito")
    .addTag("Pagos", "Gestión y procesamiento de pagos")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = envConfig.port;
  await app.listen(port);

  console.log(`🚀 API corriendo en http://localhost:${port}`);
  console.log(`📖 Swagger docs en http://localhost:${port}/docs`);
}

bootstrap();
