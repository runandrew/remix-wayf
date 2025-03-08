import {
  integer,
  pgTable,
  varchar,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Availabilities } from "@/types";

export function createDrizzleClient() {
  return drizzle(process.env.DATABASE_URL!);
}

export const meetTable = pgTable("meet", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  availabilities: jsonb("availabilities")
    .$type<Availabilities>()
    .notNull()
    .default({}),
  externalId: varchar("external_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
