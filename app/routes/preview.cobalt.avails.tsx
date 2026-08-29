import { CobaltCalendar } from "@/preview/cobalt/CobaltCalendar";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Cobalt Paper Preview — WAYF Avails" },
];

export default function CobaltAvailsPreview() {
  const now = new Date();
  const preselected = [
    new Date(now.getFullYear(), now.getMonth(), 8),
    new Date(now.getFullYear(), now.getMonth(), 30),
  ];

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h1 className="cobalt-title w-full text-center">Book Club</h1>
      <p className="cobalt-subtitle text-center">
        When are you free, <span className="italic">Alex</span>?
      </p>

      <CobaltCalendar initialSelected={preselected} />

      <button type="button" className="cobalt-btn">
        Save
      </button>
    </div>
  );
}
