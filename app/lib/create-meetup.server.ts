import { create } from "@/api/services/meet";
import { getDatabaseUrl } from "@/env";
import type { AppLoadContext } from "react-router";
import { redirect } from "react-router";

export async function createMeetupResponse(
  request: Request,
  context: AppLoadContext,
): Promise<Response> {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return redirect("/?error=name", 303);
  }

  try {
    const id = await create(getDatabaseUrl(context), name);
    return redirect(`/m/${id}`, 303);
  } catch {
    return redirect("/?error=create", 303);
  }
}
