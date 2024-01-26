import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

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
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {text}
        </Button>
    );
}
