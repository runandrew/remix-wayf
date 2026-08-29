import { find, updateMeetAvails } from "@/api/services/meet";
import { IconPencil } from "@/components/icons";
import { SubmitButton } from "@/components/SubmitButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { getDatabaseUrl } from "@/env";
import { formatDay, parseDay } from "@/lib/dates";
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
    throw new Response("Not Found", { status: 404 });
  }
  return id;
}

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const meet = await find(getDatabaseUrl(context), requireId(params.uuid));
  if (!meet) {
    throw new Response("Not Found", { status: 404 });
  }
  return { meet };
};

const Avails = () => {
  const { meet } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [, setSearchParams] = useSearchParams();

  return (
    <div className="flex w-full flex-col items-center gap-4 pt-20">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
        {meet.name}
      </h1>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Add your name
      </h3>
      <Form className="pb-4">
        <div className="flex flex-row gap-4">
          <Input name="group" type="text" placeholder="Name" />
          <SubmitButton
            text="Next"
            submitting={navigation.state === "submitting"}
            disabled={navigation.state === "loading"}
          />
        </div>
      </Form>
      {Object.keys(meet.availabilities).length !== 0 && (
        <div className="w-full">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight pb-2">
            Returning?
          </h3>
          <div>
            {Object.keys(meet.availabilities).map((group) => {
              return (
                <div key={group} className="py-1">
                  <div className="flex flex-row items-center gap-4">
                    <h4 className="scroll-m-20 text-lg tracking-tight">
                      {group}
                    </h4>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSearchParams(
                          new URLSearchParams({
                            group: encodeURIComponent(group),
                          }),
                        )
                      }
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
  const group = url.searchParams.get("group") ?? "";
  const dates = formData.get("dates")?.toString() ?? "";

  await updateMeetAvails(
    getDatabaseUrl(context),
    id,
    decodeURIComponent(group),
    dates.split(",").filter(Boolean),
  );

  return redirect(`/m/${id}`);
};

function AddAvails() {
  const { meet } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const decodedGroup = decodeURIComponent(searchParams.get("group") ?? "");
  const dates = meet.availabilities[decodedGroup] ?? [];
  const [multiDates, setMultiDates] = React.useState<Date[] | undefined>(
    dates.map((date: { day: string }) => parseDay(date.day)),
  );
  const navigation = useNavigation();

  return (
    <div className="flex w-full flex-col items-center gap-4 pt-20">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
        {meet.name}
      </h1>
      <h4 className="scroll-m-20 pb-4 text-xl font-semibold tracking-tight">
        {`When are you free, ${decodedGroup}?`}
      </h4>
      <Form method="post">
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
            onSelect={setMultiDates}
            className="rounded-md border"
          />
          <div>
            <SubmitButton
              text="Save"
              submitting={navigation.state === "submitting"}
              disabled={navigation.state === "loading"}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}

export default function Wrapper() {
  const [searchParams] = useSearchParams();
  if (searchParams.has("group")) {
    return <AddAvails />;
  }
  return <Avails />;
}
