import { useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CobaltCalendar({
  initialSelected = [],
  month: initialMonth,
}: {
  initialSelected?: Date[];
  month?: { year: number; month: number };
}) {
  const now = new Date();
  const [view, setView] = useState(
    initialMonth ?? { year: now.getFullYear(), month: now.getMonth() },
  );
  const [selected, setSelected] = useState<Date[]>(initialSelected);

  const { year, month } = view;
  const totalDays = daysInMonth(year, month);
  const leading = startWeekday(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setView((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { year: v.year, month: v.month - 1 },
    );
  };

  const nextMonth = () => {
    setView((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { year: v.year, month: v.month + 1 },
    );
  };

  const toggle = (day: number) => {
    const date = new Date(year, month, day);
    setSelected((prev) => {
      const exists = prev.some((d) => sameDay(d, date));
      return exists
        ? prev.filter((d) => !sameDay(d, date))
        : [...prev, date];
    });
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full max-w-[280px]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="bg-transparent px-2 py-1 font-sans text-lg text-[var(--cobalt-ink)]"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' }}
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="bg-transparent px-2 py-1 font-sans text-lg text-[var(--cobalt-ink)]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="pb-2 text-center text-xs text-[var(--cobalt-muted)]"
            style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' }}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-10" />;
          }
          const date = new Date(year, month, day);
          const isSelected = selected.some((d) => sameDay(d, date));
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className="flex h-10 w-full items-center justify-center text-sm"
              style={{
                fontFamily: '"Newsreader", Georgia, serif',
                background: isSelected ? "var(--cobalt-accent)" : "transparent",
                color: isSelected ? "#fff" : "var(--cobalt-ink)",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
