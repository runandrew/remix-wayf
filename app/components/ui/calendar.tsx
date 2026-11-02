import * as React from "react";
import {
  DayButton,
  DayPicker,
  type ChevronProps,
  type DayButtonProps,
} from "react-day-picker";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const navButton = cn(
  buttonVariants({ variant: "outline" }),
  "h-11 w-11 bg-transparent p-0 opacity-50 hover:opacity-100",
);

function CalendarChevron({ orientation = "left", className }: ChevronProps) {
  const Icon =
    orientation === "left" || orientation === "up"
      ? IconChevronLeft
      : IconChevronRight;
  return <Icon className={cn("h-4 w-4", className)} />;
}

function CalendarDayButton({
  day,
  modifiers,
  className,
  ...props
}: DayButtonProps) {
  return (
    <DayButton
      day={day}
      modifiers={modifiers}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "h-11 w-11 p-0 font-normal",
        modifiers.today && "bg-accent text-accent-foreground",
        modifiers.outside &&
          "text-muted-foreground opacity-50 group-aria-selected:bg-primary group-aria-selected:text-primary-foreground group-aria-selected:opacity-100",
        modifiers.disabled &&
          "text-muted-foreground opacity-50 group-aria-selected:bg-primary group-aria-selected:text-primary-foreground group-aria-selected:opacity-100",
        modifiers.selected &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground group-aria-selected:opacity-100",
        modifiers.range_middle &&
          "group-aria-selected:bg-accent group-aria-selected:text-accent-foreground",
        modifiers.range_end && "day-range-end",
        modifiers.hidden && "invisible",
        className,
      )}
      {...props}
    />
  );
}

function Calendar({
  className,
  classNames,
  components,
  labels,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        // v10 pins the around-layout nav to the month content box. These
        // offsets put the buttons and the day grid on the v8 screenshot boxes.
        month: "relative -mt-2",
        month_caption: "flex h-11 items-center justify-center",
        caption_label: "text-sm font-medium",
        button_previous: cn(navButton, "absolute left-1 top-0"),
        button_next: cn(navButton, "absolute right-1 top-0"),
        month_grid: "mt-1 w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-11 rounded-md text-[0.8rem] font-normal",
        week: "mt-2 flex w-full",
        day: "group relative h-11 w-11 p-0 text-center text-sm focus-within:relative focus-within:z-20 aria-selected:bg-accent first:aria-selected:rounded-l-md last:aria-selected:rounded-r-md",
        day_button: "",
        selected: "",
        today: "",
        outside: "day-outside",
        disabled: "",
        hidden: "invisible",
        range_end: "day-range-end",
        range_middle: "",
        ...classNames,
      }}
      labels={{
        labelPrevious: () => "Go to previous month",
        labelNext: () => "Go to next month",
        labelDayButton: (date, _modifiers, _options, dateLib) =>
          dateLib?.format(date, "d") ?? String(date.getDate()),
        ...labels,
      }}
      components={{
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
      navLayout="around"
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
