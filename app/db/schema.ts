import { Availabilities } from "@/types";
import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const meetTable = pgTable("meet", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  availabilities: jsonb("availabilities")
    .$type<Availabilities>()
    .notNull()
    .default({}),
  externalId: varchar("external_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
