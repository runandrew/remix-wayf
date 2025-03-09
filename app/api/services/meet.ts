import { Availabilities, Meet } from "@/types";
import {
  create as drizzleCreate,
  find as drizzleFind,
  updateAvailabilities as drizzleUpdateAvailabilities,
} from "@/api/repositories/meetDrizzle";
import ShortUniqueId from "short-unique-id";

export async function create(name: string): Promise<Meet> {
  const uid = new ShortUniqueId({ length: 10 });
  const externalId = uid.rnd();

  return drizzleCreate(name, externalId);
}

export async function find(externalId: string): Promise<Meet> {
  return drizzleFind(externalId);
}

export async function updateMeetAvails(
  externalId: string,
  group: string,
  dates: Date[],
): Promise<Meet> {
  const meet = await find(externalId);
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

  const updated = await drizzleUpdateAvailabilities(externalId, updatedAvails);

  if (!updated) {
    throw new Error("Failed to update availabilities");
  }

  return updated;
}
