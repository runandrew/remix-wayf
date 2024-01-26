import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { addMeetAvails, findMeet } from "@/api/meet";
import { redirect, json } from "@remix-run/node";
import {
    Link,
    useLoaderData,
    Form,
    useNavigation,
    useParams,
} from "@remix-run/react";
import React from "react";
import { parseISO } from "date-fns/parseISO";
import { Calendar } from "@/components/ui/calendar";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const meet = await findMeet(params.uuid);
    if (!meet) {
        throw new Response("Not Found", { status: 404 });
    }
    return json({ meet });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const updated = await addMeetAvails(
        params.uuid,
        decodeURIComponent(params.group),
        formData
            .get("dates")
            .split(",")
            .map((d) => parseISO(d))
    );

    console.log(updated);
    return redirect(`/m/${params.uuid}`);
};

export default function AddAvails() {
    const { meet } = useLoaderData<typeof loader>();
    const params = useParams();
    const decodedGroup = decodeURIComponent(params.group);
    const dates = meet.availabilities[decodedGroup] ?? [];
    const [multiDates, setMultiDates] = React.useState<Date[] | undefined>(
        dates.map((date) => parseISO(date.day))
    );
    const navigation = useNavigation();

    return (
        <main className="flex min-h-screen items-center flex-col gap-4 pt-20 px-4 w-full max-w-sm mx-auto">
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
                            submitting={navigation.state !== "idle"}
                        />
                    </div>
                </div>
            </Form>
        </main>
    );
}
