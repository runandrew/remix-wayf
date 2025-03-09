import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: "https://eeadb8a5d2842519c670780239f69a0c@o4508948532559872.ingest.us.sentry.io/4508948536033280",
  tracesSampleRate: 1,
});
