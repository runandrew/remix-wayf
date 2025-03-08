import { integer, pgTable, varchar, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { Availabilities } from "@/types";

export const meetTable = pgTable("meet", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull(),
  availabilities: jsonb('availabilities').$type<Availabilities>().notNull().default({}),
  uuid: uuid("uuid").notNull().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Meet = typeof meetTable.$inferSelect;
export type NewMeet = typeof meetTable.$inferInsert;
