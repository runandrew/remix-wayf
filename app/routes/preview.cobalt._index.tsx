import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Cobalt Paper Preview — WAYF Home" },
];

export default function CobaltHomePreview() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="cobalt-wordmark">WAYF</h1>
        <p className="cobalt-tagline">
          Scheduling meetups <i>simplified</i>
        </p>
      </div>

      <form
        className="flex w-full flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-row items-end gap-4">
          <input
            className="cobalt-input"
            type="text"
            placeholder="Book Club"
            defaultValue=""
            aria-label="Meetup name"
          />
          <button type="submit" className="cobalt-btn">
            Create
          </button>
        </div>
      </form>

      <button type="button" className="cobalt-link">
        About
      </button>
    </div>
  );
}
