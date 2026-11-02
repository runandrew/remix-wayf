import { describe, expect, it } from "vitest";
import { availsByDate } from "../../app/lib/avails";

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
