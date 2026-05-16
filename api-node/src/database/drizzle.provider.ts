import { Provider } from "@nestjs/common";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres = require("postgres");

import * as schema from "./schema";

export const DRIZZLE = Symbol("DRIZZLE");

export const drizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: async () => {
    const databaseUrl =
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/pagos_db";

    const client = postgres(databaseUrl);

    // Esta sincronización ligera existe solo por comodidad para la prueba técnica.
    // En un proyecto real se deberían usar migraciones formales, no ejecutar SQL al arranque.
    const initSqlPath = process.env.DOCKER_ENV
      ? "/app/database/init.sql"
      : resolve(process.cwd(), "../database/init.sql");
    const initSql = await readFile(initSqlPath, "utf-8");

    await client.unsafe(initSql);

    return drizzle(client, { schema });
  },
};
