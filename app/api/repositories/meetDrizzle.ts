import "dotenv/config";
import { eq } from "drizzle-orm";
import { createDrizzleClient, meetTable } from "./drizzleConfig";
import { Meet, Availabilities } from "@/types";

type DrizzleMeet = typeof meetTable.$inferSelect;

// Create meet
export async function create(name: string): Promise<Meet> {
  const db = createDrizzleClient();
  const [meet]: DrizzleMeet[] = await db
    .insert(meetTable)
    .values({ name })
    .returning();

  return meet;
}

// Find meet
export async function find(uuid: string): Promise<Meet> {
  const db = createDrizzleClient();
  const [meet]: DrizzleMeet[] = await db
    .select()
    .from(meetTable)
    .where(eq(meetTable.uuid, uuid));

  if (!meet) {
    throw new Error("Meet not found");
  }

  return meet;
}

// Update meet availabilities
export async function updateAvailabilities(
  uuid: string,
  availabilities: Availabilities,
): Promise<Meet> {
  const db = createDrizzleClient();
  const [meet]: DrizzleMeet[] = await db
    .update(meetTable)
    .set({ availabilities })
    .where(eq(meetTable.uuid, uuid))
    .returning();

  if (!meet) {
    throw new Error("Meet not found");
  }

  return meet;
}
