import { Input } from "@/components/ui/input";
import { Form, redirect, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { create } from "@/api/meet";
import { SubmitButton } from "~/components/SubmitButton";
import { ModeToggle } from "~/components/ModeToggle";

export const meta: MetaFunction = () => {
    return [
        { title: "WAYF: When are you free?" },
        { name: "description", content: "Scheduling, simplified" },
    ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const m = create(formData.get("name") as string); // use zod
    return redirect(`/m/${(await m).uuid}`);
};

export default function Index() {
    const navigation = useNavigation();

    return (
        <main className="flex min-h-screen items-center flex-col gap-4 pt-20 px-4 w-full max-w-sm mx-auto">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
                WAYF
            </h1>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight pb-4">
                Scheduling meetups <i>simplified</i>
            </h4>
            <Form method="post">
                <div className="flex flex-row gap-4">
                    <Input
                        name="name"
                        type="name"
                        placeholder="Meetup name"
                        autoComplete="off"
                        autoCapitalize="words"
                        required
                    />
                    <SubmitButton
                        submitting={navigation.state !== "idle"}
                        text="Create"
                    />
                </div>
            </Form>
            <ModeToggle />
        </main>
    );
}
