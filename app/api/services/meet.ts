import { Availabilities, Meet } from "@/types";
import {
  create as drizzleCreate,
  find as drizzleFind,
  updateAvailabilities as drizzleUpdateAvailabilities,
} from "@/api/repositories/meetDrizzle";

export async function create(name: string): Promise<Meet> {
  const uuid = crypto.randomUUID();

  return drizzleCreate(name, uuid);
}

export async function find(uuid: string): Promise<Meet> {
  return drizzleFind(uuid);
}

export async function updateMeetAvails(
  uuid: string,
  group: string,
  dates: Date[],
): Promise<Meet> {
  const meet = await find(uuid);
  const avails = meet.availabilities;

  // Update availabilities
  const updatedAvails: Availabilities = {
    ...avails,
    [group]: dates
      .filter((d) => d.toString() !== "Invalid Date")
      .map((d) => ({
        day: d.toISOString().slice(0, 10), // Updates date to "yyyy-MM-dd" format
      })),
  };

  const updated = await drizzleUpdateAvailabilities(uuid, updatedAvails);

  if (!updated) {
    throw new Error("Failed to update availabilities");
  }

  return updated;
}
