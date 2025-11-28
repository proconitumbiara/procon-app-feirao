import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

//Tabela para armazenar usuários
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar sessões
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

//Tabela para armazenar setores
export const sectorsTable = pgTable("sectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Tabela para armazenar tickets
export const ticketsTable = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  costumer_name: text("costumer_name").notNull(),
  status: text("status").notNull().default("pending"),
  calledAt: timestamp("called_at"),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  sectorId: uuid("sector_id")
    .notNull()
    .references(() => sectorsTable.id, { onDelete: "cascade" }),
});

//Tabela para armazenar logs
export const logsTable = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  sectorId: uuid("sector_id").references(() => sectorsTable.id, {
    onDelete: "cascade",
  }),
  ticketId: uuid("ticket_id").references(() => ticketsTable.id, {
    onDelete: "cascade",
  }),
  createdAT: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
