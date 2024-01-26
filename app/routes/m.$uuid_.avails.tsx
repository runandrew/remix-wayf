import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { SubmitButton } from "~/components/SubmitButton";
import { findMeet } from "@/api/meet";
import { redirect, json } from "@remix-run/node";
import {
    Link,
    useLoaderData,
    Form,
    useNavigation,
    useParams,
} from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const meet = await findMeet(params.uuid);
    if (!meet) {
        throw new Response("Not Found", { status: 404 });
    }
    return json({ meet });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    return redirect(`/m/${params.uuid}/avails/${formData.get("group")}`);
};

const Avails = () => {
    const { meet } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const params = useParams();

    return (
        <main className="flex min-h-screen items-center flex-col gap-4 pt-20 px-4 w-full max-w-sm mx-auto">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
                {meet.name}
            </h1>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Add your name
            </h3>
            <Form method="post" className="pb-4">
                <div className="flex flex-row gap-4">
                    <Input name="group" type="text" placeholder="Name" />
                    <SubmitButton
                        text="Next"
                        submitting={navigation.state !== "idle"}
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
                                            asChild
                                        >
                                            <Link
                                                to={`/m/${
                                                    params.uuid
                                                }/avails/${encodeURIComponent(
                                                    group
                                                )}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
};

export default Avails;
