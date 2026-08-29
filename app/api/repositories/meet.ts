import { getDb, getNeon } from "@/db/client";
import { meetTable } from "@/db/schema";
import { Availabilities, Meet } from "@/types";
import { eq } from "drizzle-orm";

type DrizzleMeet = typeof meetTable.$inferSelect;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function drizzleMeetToMeet(meet: DrizzleMeet): Meet {
  return {
    uuid: meet.externalId,
    name: meet.name,
    availabilities: meet.availabilities,
    createdAt: toDate(meet.createdAt),
    updatedAt: toDate(meet.updatedAt),
  };
}

export async function create(
  databaseUrl: string,
  name: string,
  externalId: string,
): Promise<string> {
  const db = getDb(databaseUrl);
  const [meet] = await db
    .insert(meetTable)
    .values({ name, externalId })
    .returning({ externalId: meetTable.externalId });

  if (!meet) {
    throw new Error("Failed to create meet");
  }

  return meet.externalId;
}

export async function find(
  databaseUrl: string,
  externalId: string,
): Promise<Meet | null> {
  const db = getDb(databaseUrl);
  const [meet] = await db
    .select()
    .from(meetTable)
    .where(eq(meetTable.externalId, externalId));

  if (!meet) {
    return null;
  }

  return drizzleMeetToMeet(meet);
}

export async function mergeAvailabilities(
  databaseUrl: string,
  externalId: string,
  group: string,
  days: { day: string }[],
): Promise<boolean> {
  const sql = getNeon(databaseUrl);
  const patch: Availabilities = { [group]: days };
  const rows = await sql`
    UPDATE meet
    SET
      availabilities = coalesce(availabilities, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb,
      updated_at = now()
    WHERE external_id = ${externalId}
    RETURNING external_id
  `;
  return Array.isArray(rows) && rows.length > 0;
}
