import { create } from "@/api/services/meet";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { getDatabaseUrl } from "@/env";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useNavigation } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "WAYF: When are you free?" },
    { name: "description", content: "Scheduling, simplified" },
  ];
};

export function headers() {
  return {
    "Cache-Control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  };
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Response("Name is required", { status: 400 });
  }
  const id = await create(getDatabaseUrl(context), name);
  return redirect(`/m/${id}`);
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
            placeholder="Name, e.g. Book Club 📚"
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
      <details className="w-full max-w-sm text-center">
        <summary className="cursor-pointer text-sm font-medium underline-offset-4 hover:underline">
          About
        </summary>
        <div className="pt-2 text-left text-sm">
          <h5 className="font-semibold pb-1">WAYF: When are you free?</h5>
          <p>
            Scheduling applications have become increasingly complicated. They
            are littered with unnecessary features and demand user accounts.
            WAYF focuses on a user-friendly experience to find the perfect
            meeting times for everyone involved. Say goodbye to unnecessary
            complexities and hello to efficient, stress-free scheduling.
          </p>
        </div>
      </details>
    </div>
  );
}
