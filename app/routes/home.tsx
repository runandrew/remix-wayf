import { AboutPopover } from "@/components/AboutPopover";
import { FormError } from "@/components/FormError";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { formErrorMessage } from "@/lib/form-errors";
import type { MetaFunction } from "react-router";
import { Form, useNavigation, useSearchParams } from "react-router";

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

export default function Index() {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const error = formErrorMessage(searchParams.get("error"));
  const submitting = navigation.state === "submitting";

  return (
    <div className="flex w-full flex-col items-center gap-6 pt-16">
      <div className="flex w-full flex-col items-center gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">WAYF</h1>
        <p className="text-xl font-semibold tracking-tight">
          Scheduling meetups <i>simplified</i>
        </p>
      </div>
      <Form method="post" action="/create" className="flex w-full flex-col gap-2">
        <div className="flex flex-row items-center gap-3">
          <label htmlFor="meetup-name" className="sr-only">
            Meetup name
          </label>
          <Input
            id="meetup-name"
            name="name"
            type="text"
            placeholder="Name, e.g. Book Club 📚"
            autoComplete="off"
            autoCapitalize="words"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "create-error" : undefined}
          />
          <SubmitButton
            submitting={submitting}
            text="Create"
            disabled={navigation.state === "loading"}
          />
        </div>
        <FormError id="create-error" message={error} />
      </Form>
      <AboutPopover />
    </div>
  );
}
