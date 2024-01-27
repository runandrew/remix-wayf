import { create } from "@/api/meet";
import { Input } from "@/components/ui/input";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useNavigation } from "@remix-run/react";
import { SubmitButton } from "@/components/SubmitButton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const meta: MetaFunction = () => {
    return [
        { title: "WAYF: When are you free?" },
        { name: "description", content: "Scheduling, simplified" },
    ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const m = await create((formData.get("name") as string).trim()); // use zod
    return redirect(`/m/${m.uuid}`);
};

export default function Index() {
    const navigation = useNavigation();

    return (
        <div className="flex w-full flex-col items-center gap-4 pt-20">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
                WAYF
            </h1>
            <h4 className="scroll-m-20 pb-4 text-xl font-semibold tracking-tight">
                Scheduling meetups <i>simplified</i>
            </h4>
            <Form method="post">
                <div className="flex flex-row gap-4">
                    <Input
                        name="name"
                        type="name"
                        placeholder="Book Club 📚"
                        autoComplete="off"
                        autoCapitalize="words"
                        required
                    />
                    <SubmitButton
                        submitting={navigation.state === "submitting"}
                        text="Create"
                        disabled={navigation.state === "loading"}
                    />
                </div>
            </Form>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="link">About</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <h5 className="font-semibold pb-1">
                        WAYF: When are you free?
                    </h5>
                    <p>
                        Scheduling applications have become increasingly
                        complicated. They are littered with unnecessary
                        features, and demand user accounts. WAYF focuses on a
                        user-friendly experience to find the perfect meeting
                        times for everyone involved. Say goodbye to unnecessary
                        complexities and hello to efficient, stress-free
                        scheduling.
                    </p>
                </PopoverContent>
            </Popover>
        </div>
    );
}
