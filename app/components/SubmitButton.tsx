import { IconSpinner } from "@/components/icons";
import { Button } from "./ui/button";

export function SubmitButton({
  text,
  submitting,
  disabled,
}: {
  text: string;
  submitting: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="submit"
      aria-disabled={submitting}
      disabled={submitting || disabled}
    >
      {submitting && <IconSpinner className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}
