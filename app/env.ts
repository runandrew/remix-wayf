import type { AppLoadContext } from "react-router";

export function getDatabaseUrl(context: AppLoadContext): string {
  const env = context.cloudflare.env;
  const databaseUrl = env.DATABASE_URL || env.VITE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return databaseUrl;
}
