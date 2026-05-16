import { Provider } from "@nestjs/common";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres = require("postgres");

import * as schema from "./schema";

export const DRIZZLE = Symbol("DRIZZLE");

export const drizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const databaseUrl =
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/pagos_db";

    const client = postgres(databaseUrl);
    return drizzle(client, { schema });
  },
};
