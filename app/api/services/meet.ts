import { Availabilities, Meet } from "@/types";
import {
  create as drizzleCreate,
  find as drizzleFind,
  updateAvailabilities as drizzleUpdateAvailabilities,
} from "@/api/repositories/meetDrizzle";
import {
  create as supabaseCreate,
  find as supabaseFind,
  updateAvailabilities as supabaseUpdateAvailabilities,
} from "@/api/repositories/meetSupabase";

export async function create(name: string): Promise<Meet> {
  const uuid = crypto.randomUUID();

  drizzleCreate(name, uuid)
    .then((m) => {
      console.log("Drizzle created: ", m);
    })
    .catch((e) => {
      console.error("Drizzle create error: ", e);
    });

  return supabaseCreate(name, uuid);
}

export async function find(uuid: string): Promise<Meet> {
  drizzleFind(uuid)
    .then((m) => {
      console.log("Drizzle found: ", m);
    })
    .catch((e) => {
      console.error("Drizzle find error: ", e);
    });

  return supabaseFind(uuid);
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

  drizzleUpdateAvailabilities(uuid, updatedAvails)
    .then((m) => {
      console.log("Drizzle updated: ", m);
    })
    .catch((e) => {
      console.error("Drizzle update error: ", e);
    });

  const updated = await supabaseUpdateAvailabilities(uuid, updatedAvails);

  if (!updated) {
    throw new Error("Failed to update availabilities");
  }

  return updated;
}
