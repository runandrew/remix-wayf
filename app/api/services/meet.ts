import {
  create as insertMeet,
  find as findMeet,
  mergeAvailabilities,
} from "@/api/repositories/meet";
import { isValidDay } from "@/lib/dates";
import { newExternalId } from "@/lib/id";
import { Meet } from "@/types";

export async function create(
  databaseUrl: string,
  name: string,
): Promise<string> {
  return insertMeet(databaseUrl, name, newExternalId());
}

export async function find(
  databaseUrl: string,
  externalId: string,
): Promise<Meet | null> {
  return findMeet(databaseUrl, externalId);
}

export async function updateMeetAvails(
  databaseUrl: string,
  externalId: string,
  group: string,
  dates: string[],
): Promise<void> {
  const days = dates
    .map((d) => d.trim())
    .filter(isValidDay)
    .map((day) => ({ day }));

  const updated = await mergeAvailabilities(
    databaseUrl,
    externalId,
    group,
    days,
  );

  if (!updated) {
    throw new Response("Not Found", { status: 404 });
  }
}
