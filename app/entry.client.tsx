import { PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const apiHost =
  import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

if (token) {
  posthog.init(token, {
    api_host: apiHost,
    defaults: "2026-01-30",
    capture_pageview: "history_change",
    autocapture: true,
    disable_session_recording: true,
    capture_exceptions: false,
    person_profiles: "identified_only",
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <PostHogProvider client={posthog}>
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    </PostHogProvider>,
  );
});
