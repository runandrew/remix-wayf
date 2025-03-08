import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Meet as DbMeet, meetTable } from './schema';
import { eq } from 'drizzle-orm';
import { Meet } from "@/types"

const db = drizzle(process.env.DATABASE_URL!);

export async function create(name: string): Promise<Meet> {
    const [meet]: DbMeet[] = await db.insert(meetTable)
    .values({ name })
    .returning();

    return meet;
}

export async function findMeet(uuid: string) {
    const [meet]: DbMeet[] = await db.select()
    .from(meetTable)
    .where(eq(meetTable.uuid, uuid))
    .limit(1);

  if (!meet) {
    throw new Error('Meet not found');
  }

  return meet;
}

export async function addMeetAvails(
  uuid: string,
  group: string, 
  dates: Date[]
): Promise<Meet> {
  // Get current meet
  const meet = await findMeet(uuid);
  const avails = meet.availabilities;

  // Update availabilities
  const updatedAvails = {
    ...avails,
    [group]: dates
      .filter((d) => d.toString() !== "Invalid Date")
      .map((d) => ({
        day: d.toISOString().slice(0, 10), // Creates "yyyy-MM-dd"
      })),
  };

  const [updated] = await db.update(meetTable)
    .set({ availabilities: updatedAvails, updatedAt: new Date() })
    .where(eq(meetTable.uuid, uuid))
    .returning();

  if (!updated) {
    throw new Error('Failed to update meet availabilities');
  }

  return updated;
}

