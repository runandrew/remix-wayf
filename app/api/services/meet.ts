import { Availabilities, Meet } from "@/types";
import { parseISO, isValid, format } from "date-fns";
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

// Validate date strings in the format "yyyy-MM-dd" and that it's a valid date. Returns null if these checks fail.
function normalizeAvailDay(day: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return null;
  }

  const parsed = parseISO(day);
  if (!isValid(parsed)) {
    return null;
  }

  // Reject rollover cases like 2024-02-30 -> 2024-03-01
  if (format(parsed, "yyyy-MM-dd") !== day) {
    return null;
  }

  return day;
}

export async function updateMeetAvails(
  externalId: string,
  group: string,
  dates: string[],
): Promise<Meet> {
  const meet = await find(externalId);
  const avails = meet.availabilities;

  // Update availabilities
  const updatedAvails: Availabilities = {
    ...avails,
    [group]: dates
      .map((d) => normalizeAvailDay(d.trim()))
      .filter((d): d is string => d !== null)
      .map((day) => ({ day })),
  };

  const updated = await drizzleUpdateAvailabilities(externalId, updatedAvails);

  if (!updated) {
    throw new Error("Failed to update availabilities");
  }

  return updated;
}
