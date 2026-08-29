/// <reference types="vite/client" />

export {};

declare global {
  const __WAYF_HOMEPAGE_CACHE_ID__: string;

  interface Env {
    DATABASE_URL?: string;
    // Legacy Hono Worker used this name in .env.example.
    VITE_DATABASE_URL?: string;
  }
}

declare module "virtual:react-router/server-build" {
  import type { ServerBuild } from "react-router";
  const serverBuild: ServerBuild;
  export default serverBuild;
}
