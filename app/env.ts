import { cloudflareContext } from "@/cloudflare-context";
import type { RouterContextProvider } from "react-router";

export function getDatabaseUrl(context: RouterContextProvider): string {
  const env = context.get(cloudflareContext).env;
  const databaseUrl = env.DATABASE_URL || env.VITE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return databaseUrl;
}
