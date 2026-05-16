import { Provider } from "@nestjs/common";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres = require("postgres");

import * as schema from "./schema";
import { envConfig } from "../config/env.config";

export const DRIZZLE = Symbol("DRIZZLE");

export const drizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: async () => {
    const client = postgres(envConfig.databaseUrl);

    // Esta sincronización ligera existe solo por comodidad para la prueba técnica.
    // En un proyecto real se deberían usar migraciones formales, no ejecutar SQL al arranque.
    try {
      const initSqlPath = envConfig.isDocker
        ? "/app/database/init.sql"
        : resolve(process.cwd(), "../database/init.sql");
      const initSql = await readFile(initSqlPath, "utf-8");

      await client.unsafe(initSql);
    } catch (error) {
      console.warn(
        "No se pudo ejecutar init.sql al iniciar. El proyecto continuará, pero la base de datos podría no estar sincronizada.",
        error,
      );
    }

    return drizzle(client, { schema });
  },
};
