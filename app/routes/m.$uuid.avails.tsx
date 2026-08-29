import { find, updateMeetAvails } from "@/api/services/meet";
import { FormError } from "@/components/FormError";
import { IconPencil } from "@/components/icons";
import { SubmitButton } from "@/components/SubmitButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { getDatabaseUrl } from "@/env";
import { formatDay, parseDay, startOfToday } from "@/lib/dates";
import { formErrorMessage } from "@/lib/form-errors";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  Form,
  redirect,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import React from "react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.meet.name ?? "When are you free?"} | WAYF` },
    { name: "description", content: "Scheduling, simplified" },
  ];
};

function requireId(uuid: string | undefined): string {
  const id = uuid?.trim();
  if (!id) {
    throw new Response("Meetup not found", { status: 404 });
  }
  return id;
}

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const meet = await find(getDatabaseUrl(context), requireId(params.uuid));
  if (!meet) {
    throw new Response("Meetup not found", { status: 404 });
  }
  return { meet };
};

const Avails = () => {
  const { meet } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const error = formErrorMessage(searchParams.get("error"));

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6 pt-16">
      <h1 className="w-full break-words text-center text-4xl font-extrabold tracking-tight">
        {meet.name}
      </h1>
      <h2 className="text-2xl font-semibold tracking-tight">Add your name</h2>
      <Form method="get" className="flex w-full flex-col gap-2">
        <div className="flex flex-row items-center gap-3">
          <label htmlFor="group-name" className="sr-only">
            Your name
          </label>
          <Input
            id="group-name"
            name="group"
            type="text"
            placeholder="Name"
            autoComplete="off"
            autoCapitalize="words"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "name-error" : undefined}
          />
          <SubmitButton
            text="Next"
            submitting={navigation.state === "submitting"}
            disabled={navigation.state === "loading"}
          />
        </div>
        <FormError id="name-error" message={error} />
      </Form>
      {Object.keys(meet.availabilities).length !== 0 && (
        <div className="w-full min-w-0">
          <h2 className="pb-2 text-xl font-semibold tracking-tight">
            Returning?
          </h2>
          <div>
            {Object.keys(meet.availabilities).map((group) => {
              return (
                <div key={group} className="py-1">
                  <div className="flex min-w-0 flex-row items-center gap-3">
                    <p className="min-w-0 flex-1 break-words text-lg tracking-tight">
                      {group}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      aria-label={`Edit ${group}`}
                      onClick={() => setSearchParams({ group })}
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const id = requireId(params.uuid);
  const formData = await request.formData();
  const url = new URL(request.url);
  const group = (url.searchParams.get("group") ?? "").trim();
  const dates = formData.get("dates")?.toString() ?? "";

  if (!group) {
    return redirect(`/m/${id}/avails?error=name`, 303);
  }

  try {
    await updateMeetAvails(
      getDatabaseUrl(context),
      id,
      group,
      dates.split(",").filter(Boolean),
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return redirect(`/m/${id}/avails?group=${encodeURIComponent(group)}&error=save`, 303);
  }

  return redirect(`/m/${id}`, 303);
};

function AddAvails() {
  const { meet } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const decodedGroup = searchParams.get("group") ?? "";
  const dates = meet.availabilities[decodedGroup] ?? [];
  const today = startOfToday();
  const [multiDates, setMultiDates] = React.useState<Date[] | undefined>(
    dates.map((date: { day: string }) => parseDay(date.day)),
  );
  const navigation = useNavigation();
  const error = formErrorMessage(searchParams.get("error"));

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6 pt-16">
      <h1 className="w-full break-words text-center text-4xl font-extrabold tracking-tight">
        {meet.name}
      </h1>
      <h2 className="w-full break-words text-center text-xl font-semibold tracking-tight">
        {`When are you free, ${decodedGroup}?`}
      </h2>
      <Form method="post" className="w-full">
        <Input
          name="dates"
          className="hidden"
          readOnly={true}
          value={multiDates?.map((d) => formatDay(d))}
        />
        <div className="flex flex-col items-center gap-4">
          <Calendar
            mode="multiple"
            selected={multiDates}
            onSelect={(days) => {
              const keptPast = (multiDates ?? []).filter((day) => day < today);
              const next = (days ?? []).filter((day) => day >= today);
              setMultiDates([...keptPast, ...next]);
            }}
            disabled={{ before: today }}
            className="rounded-md border"
          />
          <SubmitButton
            text="Save"
            submitting={navigation.state === "submitting"}
            disabled={navigation.state === "loading"}
          />
          <FormError message={error} />
        </div>
      </Form>
    </div>
  );
}

export default function Wrapper() {
  const [searchParams] = useSearchParams();
  const group = searchParams.get("group");
  if (group !== null && group.trim() !== "") {
    return <AddAvails />;
  }
  return <Avails />;
}
