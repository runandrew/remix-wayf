import { describe, expect, it } from "vitest";
import { availsByDate, mergeFreeDays } from "../../app/lib/avails";

describe("free day edits", () => {
  const today = new Date(2026, 5, 15);
  const past = new Date(2026, 5, 10);
  const kept = new Date(2026, 5, 16);
  const dropped = new Date(2026, 5, 17);
  const added = new Date(2026, 5, 18);

  it("keeps past free days and replaces the future selection", () => {
    expect(
      mergeFreeDays([past, kept, dropped], [past, kept, added], today),
    ).toEqual([past, kept, added]);
  });

  it("does not add a past day that was not already free", () => {
    expect(mergeFreeDays([kept], [past, kept], today)).toEqual([kept]);
  });

  it("keeps past days when the picker clears the selection", () => {
    expect(mergeFreeDays([past, kept], undefined, today)).toEqual([past]);
  });

  it("keeps today when it is picked", () => {
    expect(mergeFreeDays([], [today], today)).toEqual([today]);
  });
});

describe("availability grouping", () => {
  it("returns no rows when nobody has marked a day", () => {
    expect(availsByDate({})).toEqual([]);
    expect(availsByDate({ Alex: [] })).toEqual([]);
  });

  it("sorts days and lists people who share a day", () => {
    expect(
      availsByDate({
        Alex: [{ day: "2026-06-17" }, { day: "2026-06-16" }],
        Blair: [{ day: "2026-06-18" }, { day: "2026-06-17" }],
      }),
    ).toEqual([
      { day: "2026-06-16", groups: ["Alex"] },
      { day: "2026-06-17", groups: ["Alex", "Blair"] },
      { day: "2026-06-18", groups: ["Blair"] },
    ]);
  });
});
