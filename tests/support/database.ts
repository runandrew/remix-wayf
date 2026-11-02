import { PGlite } from "@electric-sql/pglite";
import { pushSchema } from "drizzle-kit/api";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { meetTable } from "../../app/db/schema";
import { TEST_DATABASE_URL } from "./database-url";

export { TEST_DATABASE_URL };

type TestDatabase = {
  client: PGlite;
  db: PgliteDatabase<typeof schema>;
};

const schema = { meetTable };

const globalStore = globalThis as typeof globalThis & {
  __wayfTestDb?: TestDatabase;
};

export function refuseNeon(databaseUrl: string) {
  if (/neon\.tech|neon\.database/i.test(databaseUrl)) {
    throw new Error("Refusing a Neon database URL in tests");
  }
}

export async function resetDatabase() {
  const previous = globalStore.__wayfTestDb;
  if (previous) {
    await previous.client.close();
  }
  const client = new PGlite();
  const db = drizzle(client, { schema });
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = (() => true) as typeof process.stdout.write;
  try {
    const pushed = await pushSchema(
      schema,
      db as unknown as Parameters<typeof pushSchema>[1],
    );
    await pushed.apply();
  } finally {
    process.stdout.write = write;
  }
  globalStore.__wayfTestDb = { client, db };
}

function database(databaseUrl: string) {
  refuseNeon(databaseUrl);
  const current = globalStore.__wayfTestDb;
  if (!current) {
    throw new Error("resetDatabase() was not called");
  }
  return current;
}

export function getDb(databaseUrl: string) {
  return database(databaseUrl).db;
}

export function getNeon(databaseUrl: string) {
  const { client } = database(databaseUrl);
  return async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = "";
    const params: unknown[] = [];
    for (let i = 0; i < strings.length; i += 1) {
      text += strings[i];
      if (i < values.length) {
        params.push(values[i]);
        text += `$${params.length}`;
      }
    }
    const result = await client.query(text, params);
    return result.rows;
  };
}
