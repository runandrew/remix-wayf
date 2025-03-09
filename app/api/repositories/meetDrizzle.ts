import "dotenv/config";
import { eq } from "drizzle-orm";
import { createDrizzleClient, meetTable } from "./drizzleConfig";
import { Meet, Availabilities } from "@/types";

type DrizzleMeet = typeof meetTable.$inferSelect;

function drizzleMeetToMeet(meet: DrizzleMeet): Meet {
  return {
    uuid: meet.externalId,
    name: meet.name,
    availabilities: meet.availabilities,
    createdAt: meet.createdAt,
    updatedAt: meet.updatedAt,
  };
}

export async function create(name: string, externalId: string): Promise<Meet> {
  const db = createDrizzleClient();
  const [meet]: DrizzleMeet[] = await db
    .insert(meetTable)
    .values({ name, externalId })
    .returning();

  return drizzleMeetToMeet(meet);
}

// Find meet
export async function find(externalId: string): Promise<Meet> {
  const db = createDrizzleClient();
  const [meet]: DrizzleMeet[] = await db
    .select()
    .from(meetTable)
    .where(eq(meetTable.externalId, externalId));

  if (!meet) {
    throw new Error("Meet not found");
  }

  return drizzleMeetToMeet(meet);
}

// Update meet availabilities
export async function updateAvailabilities(
  externalId: string,
  availabilities: Availabilities,
): Promise<Meet> {
  const db = createDrizzleClient();
  const [meet]: DrizzleMeet[] = await db
    .update(meetTable)
    .set({ availabilities, updatedAt: new Date() })
    .where(eq(meetTable.externalId, externalId))
    .returning();

  if (!meet) {
    throw new Error("Meet not found");
  }

  return drizzleMeetToMeet(meet);
}

export async function upsertMeet(inputMeet: Meet) {
  const db = createDrizzleClient();

  const m = {
    name: inputMeet.name,
    externalId: inputMeet.uuid,
    availabilities: inputMeet.availabilities,
    createdAt: inputMeet.createdAt,
    updatedAt: inputMeet.updatedAt,
  };

  const [meet]: DrizzleMeet[] = await db
    .insert(meetTable)
    .values(m)
    .onConflictDoUpdate({
      target: [meetTable.externalId],
      set: m,
    })
    .returning();

  if (!meet) {
    throw new Error("Failed to upsert meet");
  }

  return drizzleMeetToMeet(meet);
}
