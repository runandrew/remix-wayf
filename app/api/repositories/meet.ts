import { createDb } from "@/db/client";
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
): Promise<Meet> {
  const db = createDb(databaseUrl);
  const [meet] = await db
    .insert(meetTable)
    .values({ name, externalId })
    .returning();

  if (!meet) {
    throw new Error("Failed to create meet");
  }

  return drizzleMeetToMeet(meet);
}

export async function find(
  databaseUrl: string,
  externalId: string,
): Promise<Meet | null> {
  const db = createDb(databaseUrl);
  const [meet] = await db
    .select()
    .from(meetTable)
    .where(eq(meetTable.externalId, externalId));

  if (!meet) {
    return null;
  }

  return drizzleMeetToMeet(meet);
}

export async function updateAvailabilities(
  databaseUrl: string,
  externalId: string,
  availabilities: Availabilities,
): Promise<Meet | null> {
  const db = createDb(databaseUrl);
  const [meet] = await db
    .update(meetTable)
    .set({ availabilities, updatedAt: new Date() })
    .where(eq(meetTable.externalId, externalId))
    .returning();

  if (!meet) {
    return null;
  }

  return drizzleMeetToMeet(meet);
}
