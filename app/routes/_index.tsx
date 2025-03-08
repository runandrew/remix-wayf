import { useState } from "react";
import { create } from "@/api/services/meet";
import { Input } from "@/components/ui/input";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useNavigation } from "@remix-run/react";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

function WeHaveMovedBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert className="bg-blue-100 dark:bg-blue-950 border-blue-500 text-blue-800 dark:text-blue-100 relative">
      <div className="flex items-center justify-between w-full">
        <div>
          <AlertTitle>We&apos;ve Moved!</AlertTitle>
          <AlertDescription>
            Our website is now at{" "}
            <a
              href="https://wayf.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-300"
            >
              wayf.vercel.app
            </a>
            . Please update your bookmarks.
          </AlertDescription>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}

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
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="link">About</Button>
        </PopoverTrigger>
        <PopoverContent>
          <h5 className="font-semibold pb-1">WAYF: When are you free?</h5>
          <p>
            Scheduling applications have become increasingly complicated. They
            are littered with unnecessary features and demand user accounts.
            WAYF focuses on a user-friendly experience to find the perfect
            meeting times for everyone involved. Say goodbye to unnecessary
            complexities and hello to efficient, stress-free scheduling.
          </p>
        </PopoverContent>
      </Popover>
      <WeHaveMovedBanner />
    </div>
  );
}
