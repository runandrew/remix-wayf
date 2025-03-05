import { integer, pgTable, varchar, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const meetTable = pgTable("meet", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  availabilities: jsonb("availabilities").notNull().default("{}"),
  uuid: uuid("uuid").notNull().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
