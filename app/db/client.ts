import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { meetTable } from "./schema";

type NeonSql = ReturnType<typeof neon>;
type Db = ReturnType<typeof createDrizzle>;

function createDrizzle(sql: NeonSql) {
  return drizzle({ client: sql, schema: { meetTable } });
}

let cachedUrl: string | undefined;
let cachedSql: NeonSql | undefined;
let cachedDb: Db | undefined;

function cacheClient(databaseUrl: string) {
  if (cachedSql && cachedDb && cachedUrl === databaseUrl) {
    return;
  }
  cachedUrl = databaseUrl;
  cachedSql = neon(databaseUrl);
  cachedDb = createDrizzle(cachedSql);
}

export function getNeon(databaseUrl: string): NeonSql {
  cacheClient(databaseUrl);
  return cachedSql as NeonSql;
}

export function getDb(databaseUrl: string): Db {
  cacheClient(databaseUrl);
  return cachedDb as Db;
}

export type { Db };
