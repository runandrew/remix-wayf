import { find } from "@/api/services/meet";
import ShareButton from "@/components/ShareButton";
import { IconCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getDatabaseUrl } from "@/env";
import { formatDayHeading } from "@/lib/dates";
import { Availabilities } from "@/types";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";

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
  const params = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const respondentCount = Object.keys(meet.availabilities).length;

  return (
    <div className="flex w-full flex-col items-center gap-4 pt-20">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
        {meet.name}
      </h1>
      <div className="flex flex-row pb-4">
        <div className="pr-4">
          <Button
            disabled={navigation.state === "loading"}
            onClick={() => navigate(`/m/${params.uuid}/avails`)}
          >
            Add Availability
          </Button>
        </div>
        <ShareButton params={{ meet }} />
      </div>
      {dates.length === 0 && (
        <div className="w-full px-4">
          <h5 className="pb-2">
            <span className="font-semibold text-lg">
              🎉 You&apos;re ready to schedule!
            </span>
          </h5>
          <ul className="list-disc list-inside">
            <li>Click &apos;Add Availability&apos; to set days you are free</li>
            <li>Share this link with your friends so they can schedule</li>
          </ul>
        </div>
      )}
      <div className="w-full pb-4">
        {dates.map((date) => (
          <div key={date.day} className="py-2">
            <div className="flex flex-row items-center">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {formatDayHeading(date.day)}
              </h4>
              <div className="pl-2">
                <span className="text-xs">
                  {`${date.groups.length} / ${respondentCount}`}
                </span>
              </div>
              {date.groups.length === respondentCount && (
                <div className="pl-2">
                  <IconCheck />
                </div>
              )}
            </div>
            <span>{date.groups.join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
