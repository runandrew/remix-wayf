import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Cobalt Paper Preview — WAYF Meet" },
];

const MOCK_DATES = [
  {
    day: "Saturday, Aug 8",
    groups: ["Alex", "Jordan"],
    overlap: 2,
    total: 3,
    full: false,
  },
  {
    day: "Friday, Aug 15",
    groups: ["Alex", "Jordan", "Sam"],
    overlap: 3,
    total: 3,
    full: true,
  },
  {
    day: "Saturday, Aug 30",
    groups: ["Alex"],
    overlap: 1,
    total: 3,
    full: false,
  },
];

function CobaltCheck() {
  return (
    <svg
      className="cobalt-check h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function CobaltMeetPreview() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="cobalt-title w-full text-center">Book Club</h1>

      <div className="flex flex-row flex-wrap items-center justify-center gap-3">
        <button type="button" className="cobalt-btn-secondary">
          Add Availability
        </button>
        <button type="button" className="cobalt-btn-secondary">
          Share
        </button>
      </div>

      <div className="w-full">
        {MOCK_DATES.map((date) => (
          <div key={date.day} className="border-t border-[rgba(28,24,20,0.12)] py-3 first:border-t-0">
            <div className="flex flex-row flex-wrap items-center gap-2">
              <h2 className="cobalt-subtitle">{date.day}</h2>
              <span className="text-xs text-[var(--cobalt-muted)]">
                {date.overlap} / {date.total}
              </span>
              {date.full && <CobaltCheck />}
            </div>
            <p className="mt-1 text-base">{date.groups.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
