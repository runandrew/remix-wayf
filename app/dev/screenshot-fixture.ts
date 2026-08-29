import type { Meet } from "@/types";

/** Dev-only meet id for color-preview screenshots when DATABASE_URL is unset. */
export const SCREENSHOT_FIXTURE_UUID = "preview-screenshots";

export const screenshotFixtureMeet: Meet = {
  uuid: SCREENSHOT_FIXTURE_UUID,
  name: "Book Club 📚",
  availabilities: {
    Alice: [{ day: "2026-09-05" }, { day: "2026-09-12" }, { day: "2026-09-19" }],
    Bob: [{ day: "2026-09-05" }, { day: "2026-09-12" }],
  },
  createdAt: new Date("2026-08-01T12:00:00Z"),
  updatedAt: new Date("2026-08-01T12:00:00Z"),
};

export function screenshotFixtureMeetFor(id: string): Meet | null {
  if (import.meta.env.DEV && id === SCREENSHOT_FIXTURE_UUID) {
    return screenshotFixtureMeet;
  }
  return null;
}
