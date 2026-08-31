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
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <IconSpinner className="h-4 w-4 animate-spin" />
        </span>
      ) : null}
    </Button>
  );
}
