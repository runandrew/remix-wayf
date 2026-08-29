import { create } from "@/api/services/meet";
import { getDatabaseUrl } from "@/env";
import type { FormErrorKey } from "@/lib/form-errors";
import type { AppLoadContext } from "react-router";
import { redirect } from "react-router";

export type CreateMeetupResult =
  | Response
  | { error: Extract<FormErrorKey, "name" | "create"> };

export async function createMeetupAction(
  request: Request,
  context: AppLoadContext,
): Promise<CreateMeetupResult> {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "name" };
  }

  try {
    const id = await create(getDatabaseUrl(context), name);
    return redirect(`/m/${id}`, 303);
  } catch {
    return { error: "create" };
  }
}

export async function createMeetupResponse(
  request: Request,
  context: AppLoadContext,
): Promise<Response> {
  const result = await createMeetupAction(request, context);
  if (result instanceof Response) {
    return result;
  }
  return redirect(`/?error=${result.error}`, 303);
}
