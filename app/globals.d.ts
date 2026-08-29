/// <reference types="vite/client" />

export {};

declare global {
  interface Env {
    DATABASE_URL: string;
  }
}

declare module "virtual:react-router/server-build" {
  import type { ServerBuild } from "react-router";
  const serverBuild: ServerBuild;
  export default serverBuild;
}
