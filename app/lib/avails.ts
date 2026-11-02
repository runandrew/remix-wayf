import type { Availabilities } from "@/types";

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
