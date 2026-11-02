import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatDay,
  formatDayHeading,
  isValidDay,
  parseDay,
  startOfToday,
} from "../../app/lib/dates";

describe("date formatting", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prints a calendar day as a weekday and short month", () => {
    expect(formatDayHeading("2026-06-15")).toBe("Monday, Jun 15");
    expect(formatDayHeading("2026-06-07")).toBe("Sunday, Jun 7");
  });

  it("round-trips a day string through the local calendar date", () => {
    expect(formatDay(parseDay("2026-01-05"))).toBe("2026-01-05");
  });

  it("accepts only real YYYY-MM-DD days", () => {
    expect(isValidDay("2026-06-15")).toBe(true);
    expect(isValidDay("2026-02-31")).toBe(false);
    expect(isValidDay("2026-13-01")).toBe(false);
    expect(isValidDay("2026-00-10")).toBe(false);
    expect(isValidDay("2026-6-15")).toBe(false);
    expect(isValidDay("15-06-2026")).toBe(false);
    expect(isValidDay("")).toBe(false);
  });

  it("starts today at local midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 23, 30, 45));
    const today = startOfToday();
    expect(formatDay(today)).toBe("2026-06-15");
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
  });
});
