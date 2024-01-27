import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
    useLoaderData,
    useNavigate,
    useNavigation,
    useParams,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { findMeet } from "~/api/meet";
import { Button } from "@/components/ui/button";
import { Availabilities } from "@/types";
import { formatDate } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";
import { CheckCircle2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import z from "zod";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: `${data?.meet.name ?? "When are you free?"} | WAYF` },
        { name: "description", content: "Scheduling, simplified" },
    ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const meet = await findMeet(z.string().parse(params.uuid));
    if (!meet) {
        throw new Response("Not Found", { status: 404 });
    }
    return json({ meet });
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

    const datesArray = Object.keys(dates)
        .map((day) => {
            return {
                day,
                groups: dates[day],
            };
        })
        .sort((a, b) => {
            return new Date(a.day).getTime() - new Date(b.day).getTime();
        });

    return datesArray;
};

export default function MeetupDetails() {
    const { meet } = useLoaderData<typeof loader>();
    const dates = availsByDate(meet.availabilities);
    const params = useParams();
    const navigation = useNavigation();
    const navigate = useNavigate();

    return (
        <div className="flex items-center flex-col gap-4 pt-20 w-full">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
                {meet.name}
            </h1>
            <div className="pb-4 flex flex-row">
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
            <div className="w-full pb-4">
                {dates.map((date) => (
                    <div key={date.day} className="py-2">
                        <div className="flex flex-row items-center">
                            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                {formatDate(parseISO(date.day), "EEEE, MMM d")}
                            </h4>
                            <div className="pl-2">
                                <span className="text-xs">
                                    {`${date.groups.length} / ${
                                        Object.keys(meet.availabilities).length
                                    }`}
                                </span>
                            </div>
                            {date.groups.length ===
                                Object.keys(meet.availabilities).length && (
                                <div className="pl-2">
                                    <CheckCircle2 size={20} color="#16a34a" />
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
