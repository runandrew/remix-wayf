import {
  create as drizzleCreate,
  find as drizzleFind,
  updateAvailabilities as drizzleUpdateAvailabilities,
} from "@/api/repositories/meet";
import { Availabilities, Meet } from "@/types";
import { format, isValid, parseISO } from "date-fns";
import ShortUniqueId from "short-unique-id";

export async function create(databaseUrl: string, name: string): Promise<Meet> {
  const uid = new ShortUniqueId({ length: 10 });
  return drizzleCreate(databaseUrl, name, uid.rnd());
}

export async function find(
  databaseUrl: string,
  externalId: string,
): Promise<Meet | null> {
  return drizzleFind(databaseUrl, externalId);
}

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
  databaseUrl: string,
  externalId: string,
  group: string,
  dates: string[],
): Promise<Meet> {
  const meet = await find(databaseUrl, externalId);
  if (!meet) {
    throw new Response("Not Found", { status: 404 });
  }

  const updatedAvails: Availabilities = {
    ...meet.availabilities,
    [group]: dates
      .map((d) => normalizeAvailDay(d.trim()))
      .filter((d): d is string => d !== null)
      .map((day) => ({ day })),
  };

  const updated = await drizzleUpdateAvailabilities(
    databaseUrl,
    externalId,
    updatedAvails,
  );

  if (!updated) {
    throw new Error("Failed to update availabilities");
  }

  return updated;
}
