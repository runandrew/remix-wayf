import { createMeetupResponse } from "@/lib/create-meetup.server";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = () => redirect("/", 302);

export const action = async ({ request, context }: ActionFunctionArgs) => {
  return createMeetupResponse(request, context);
};
