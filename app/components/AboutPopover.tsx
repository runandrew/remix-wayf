import { Button } from "@/components/ui/button";
import { useEffect, useId, useRef, useState } from "react";

export function AboutPopover() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="link"
        type="button"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen((current) => !current)}
      >
        About
      </Button>
      {open ? (
        <div
          id={titleId}
          role="dialog"
          aria-label="WAYF: When are you free?"
          className="absolute left-1/2 z-50 w-72 -translate-x-1/2 rounded-md border bg-popover p-4 text-left text-sm text-popover-foreground shadow-md"
        >
          <p className="pb-1 font-semibold">WAYF: When are you free?</p>
          <p>
            Scheduling applications have become increasingly complicated. They
            are littered with unnecessary features and demand user accounts.
            WAYF focuses on a user-friendly experience to find the perfect
            meeting times for everyone involved. Say goodbye to unnecessary
            complexities and hello to efficient, stress-free scheduling.
          </p>
        </div>
      ) : null}
    </div>
  );
}
