import type { AppLoadContext } from "react-router";

export function getDatabaseUrl(context: AppLoadContext): string {
  const databaseUrl = context.cloudflare.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return databaseUrl;
}
