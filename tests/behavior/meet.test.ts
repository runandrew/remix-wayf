import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../support/database";
import { appRequest, handle } from "../support/app";

async function createMeet(name: string) {
  const response = await handle(
    appRequest("/create", { method: "POST", form: { name } }),
  );
  const location = response.headers.get("location");
  return { response, location };
}

function meetId(location: string | null) {
  const match = location?.match(/^\/m\/([^/?]+)$/);
  if (!match) {
    throw new Error(`Expected a meet redirect, got ${location}`);
  }
  return match[1];
}

describe("meet routes", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates a meet and renders its name", async () => {
    const { response, location } = await createMeet("Picnic");
    expect(response.status).toBe(303);
    const id = meetId(location);
    const page = await handle(appRequest(`/m/${id}`));
    expect(page.status).toBe(200);
    expect(page.text).toContain("Picnic");
    expect(page.text).toContain("ready to schedule");
  });

  it("redirects an empty name to the home page", async () => {
    for (const name of ["", "   "]) {
      const { response, location } = await createMeet(name);
      expect(response.status).toBe(303);
      expect(location).toBe("/?error=name");
    }
  });

  it("returns 404 for an unknown meet", async () => {
    const page = await handle(appRequest("/m/missing-meet"));
    expect(page.status).toBe(404);
  });

  it("shows who overlaps after two people save days", async () => {
    const { location } = await createMeet("Picnic");
    const id = meetId(location);

    const alex = await handle(
      appRequest(`/m/${id}/avails?group=Alex`, {
        method: "POST",
        form: { dates: "2026-06-16,2026-06-17" },
      }),
    );
    expect(alex.status).toBe(303);
    expect(alex.headers.get("location")).toBe(`/m/${id}`);

    const blair = await handle(
      appRequest(`/m/${id}/avails?group=Blair`, {
        method: "POST",
        form: { dates: "2026-06-17,2026-06-18" },
      }),
    );
    expect(blair.status).toBe(303);

    const page = await handle(appRequest(`/m/${id}`));
    expect(page.status).toBe(200);
    expect(page.text).toContain("Picnic");
    expect(page.text).toContain("Tuesday, Jun 16");
    expect(page.text).toContain("Wednesday, Jun 17");
    expect(page.text).toContain("Thursday, Jun 18");
    expect(page.text).toContain("Alex, Blair");
    expect(page.text).toContain("2 / 2");
    expect(page.text.match(/1 \/ 2/g)).toHaveLength(2);
  });

  it("deletes a meet and then the page is gone", async () => {
    const { location } = await createMeet("Picnic");
    const id = meetId(location);
    const removed = await handle(appRequest(`/m/${id}`, { method: "DELETE" }));
    expect(removed.status).toBe(204);
    const page = await handle(appRequest(`/m/${id}`));
    expect(page.status).toBe(404);
    const again = await handle(appRequest(`/m/${id}`, { method: "DELETE" }));
    expect(again.status).toBe(404);
  });
});
