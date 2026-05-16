import {
  pgTable,
  uuid,
  varchar,
  boolean,
  numeric,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  apellido: varchar("apellido", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  telefono: varchar("telefono", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tarjetas = pgTable(
  "tarjetas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    numeroTarjeta: varchar("numero_tarjeta", { length: 19 }).notNull(),
    titular: varchar("titular", { length: 200 }).notNull(),
    fechaExpiracion: varchar("fecha_expiracion", { length: 5 }).notNull(),
    tipo: varchar("tipo", { length: 20 }).notNull().default("credito"),
    marca: varchar("marca", { length: 20 }).notNull().default("visa"),
    activa: boolean("activa").notNull().default(true),
    csv: varchar("csv", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_tarjetas_usuario_id").on(table.usuarioId),
    check("tipo_check", sql`${table.tipo} IN ('credito', 'debito')`),
    check("marca_check", sql`${table.marca} IN ('visa', 'mastercard', 'amex')`),
  ],
);

export const pagos = pgTable(
  "pagos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    tarjetaId: uuid("tarjeta_id")
      .notNull()
      .references(() => tarjetas.id, { onDelete: "cascade" }),
    monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
    moneda: varchar("moneda", { length: 3 }).notNull().default("MXN"),
    descripcion: varchar("descripcion", { length: 500 }),
    estado: varchar("estado", { length: 20 }).notNull().default("pendiente"),
    referencia: varchar("referencia", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_pagos_usuario_id").on(table.usuarioId),
    index("idx_pagos_tarjeta_id").on(table.tarjetaId),
    index("idx_pagos_estado").on(table.estado),
    check(
      "estado_check",
      sql`${table.estado} IN ('pendiente', 'aprobado', 'rechazado')`,
    ),
    check("monto_check", sql`${table.monto} > 0`),
  ],
);
