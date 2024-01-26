import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { SubmitButton } from "~/components/SubmitButton";
import { addMeetAvails, findMeet } from "@/api/meet";
import { redirect, json } from "@remix-run/node";
import {
    useLoaderData,
    Form,
    useNavigation,
    useSearchParams,
} from "@remix-run/react";
import { parseISO } from "date-fns/parseISO";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import z from "zod";

const paramSchema = z.object({
    uuid: z.string(),
});

export const loader = async ({ params: raw }: LoaderFunctionArgs) => {
    const params = paramSchema.parse(raw);
    const meet = await findMeet(params.uuid);
    if (!meet) {
        throw new Response("Not Found", { status: 404 });
    }
    return json({ meet });
};

const Avails = () => {
    const { meet } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const [_, setSearchParams] = useSearchParams();

    return (
        <div className="flex items-center flex-col gap-4 pt-20 w-full">
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
                <>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Returning?
                    </h3>
                    <div>
                        {Object.keys(meet.availabilities).map((group) => {
                            return (
                                <div key={group} className="py-2">
                                    <div className="flex flex-row items-center gap-4">
                                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                            {group}
                                        </h4>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setSearchParams(
                                                    new URLSearchParams({
                                                        group: encodeURIComponent(
                                                            group
                                                        ),
                                                    })
                                                )
                                            }
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export const action = async ({ request, params: raw }: ActionFunctionArgs) => {
    const params = paramSchema.parse(raw);
    const formData = await request.formData();
    const url = new URL(request.url);
    const group = url.searchParams.get("group") ?? "";
    const dates = formData.get("dates")?.toString() ?? "";

    await addMeetAvails(
        params.uuid,
        decodeURIComponent(group),
        dates.split(",").map((d) => parseISO(d))
    );

    return redirect(`/m/${params.uuid}`);
};

function AddAvails() {
    const { meet } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const decodedGroup = decodeURIComponent(searchParams.get("group") ?? "");
    const dates = meet.availabilities[decodedGroup] ?? [];
    const [multiDates, setMultiDates] = React.useState<Date[] | undefined>(
        dates.map((date) => parseISO(date.day))
    );
    const navigation = useNavigation();

    return (
        <div className="flex items-center flex-col gap-4 pt-20 w-full">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
                {meet.name}
            </h1>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight pb-4">
                {`When are you free, ${decodedGroup}?`}
            </h4>
            <Form method="post">
                <Input
                    name="dates"
                    className="hidden"
                    readOnly={true}
                    value={multiDates?.map((d) => d.toISOString())}
                />
                <div className="flex flex-col gap-4 items-center">
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
    } else {
        return <Avails />;
    }
}
