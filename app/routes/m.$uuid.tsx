import { find } from "@/api/services/meet";
import ShareButton from "@/components/ShareButton";
import { IconCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getDatabaseUrl } from "@/env";
import { formatDayHeading } from "@/lib/dates";
import { meetMeta } from "@/lib/seo";
import { Availabilities } from "@/types";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { Link, useLoaderData, useNavigation } from "react-router";

export const headers: HeadersFunction = () => ({
  "X-Robots-Tag": "noindex, nofollow",
});

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

export const meta: MetaFunction<typeof loader> = ({ loaderData }) =>
  meetMeta({
    name: loaderData?.meet.name,
    pathname: loaderData ? `/m/${loaderData.meet.uuid}` : "/m/",
  });

const availsByDate = (avails: Availabilities) => {
  const dates: Record<string, string[]> = {};
  for (const group in avails) {
    for (const date of avails[group]) {
      if (!dates[date.day]) {
        dates[date.day] = [];
      }
      dates[date.day].push(group);
    }
  }

  return Object.keys(dates)
    .map((day) => ({
      day,
      groups: dates[day],
    }))
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
};

export default function MeetupDetails() {
  const { meet } = useLoaderData<typeof loader>();
  const dates = availsByDate(meet.availabilities);
  const navigation = useNavigation();
  const respondentCount = Object.keys(meet.availabilities).length;
  const busy = navigation.state !== "idle";

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6 pt-16">
      <h1 className="w-full break-words text-center text-4xl font-extrabold tracking-tight">
        {meet.name}
      </h1>
      <div className="flex flex-row flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link
            to={`/m/${meet.uuid}/avails`}
            className={busy ? "pointer-events-none opacity-50" : undefined}
          >
            Add Availability
          </Link>
        </Button>
        <ShareButton params={{ meet }} />
      </div>
      {dates.length === 0 && (
        <div className="w-full">
          <p className="pb-2 text-lg font-semibold">
            🎉 You&apos;re ready to schedule!
          </p>
          <ul className="list-inside list-disc">
            <li>Click &apos;Add Availability&apos; to set days you are free</li>
            <li>Share this link with your friends so they can schedule</li>
          </ul>
        </div>
      )}
      <div className="w-full min-w-0">
        {dates.map((date) => (
          <div key={date.day} className="py-2">
            <div className="flex flex-row flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {formatDayHeading(date.day)}
              </h2>
              <span className="text-xs text-muted-foreground">
                {`${date.groups.length} / ${respondentCount}`}
              </span>
              {date.groups.length === respondentCount && (
                <IconCheck className="text-green-600 dark:text-green-500" />
              )}
            </div>
            <p className="break-words">{date.groups.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
