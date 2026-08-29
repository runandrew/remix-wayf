import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { meetTable } from "./schema";

export function createDb(databaseUrl: string) {
  return drizzle({ client: neon(databaseUrl), schema: { meetTable } });
}

export type Db = ReturnType<typeof createDb>;
