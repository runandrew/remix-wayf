import type { Availabilities } from "@/types";

export function mergeFreeDays(
  current: readonly Date[] | undefined,
  picked: readonly Date[] | undefined,
  today: Date,
): Date[] {
  const keptPast = (current ?? []).filter((day) => day < today);
  const next = (picked ?? []).filter((day) => day >= today);
  return [...keptPast, ...next];
}

export function availsByDate(avails: Availabilities) {
  const dates: Record<string, string[]> = {};
  for (const group in avails) {
    for (const date of avails[group]) {
      if (!dates[date.day]) {
        dates[date.day] = [];
      }
      dates[date.day].push(group);
    }
  }

  return Object.keys(dates)
    .map((day) => ({
      day,
      groups: dates[day],
    }))
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}
