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
      aria-busy={submitting || undefined}
      disabled={submitting || disabled}
      className="relative"
    >
      <span className={submitting ? "invisible" : undefined}>{text}</span>
      {submitting ? (
        <IconSpinner className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
      ) : null}
    </Button>
  );
}
