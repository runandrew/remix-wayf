import { execSync } from "node:child_process";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function homepageCacheId(): string {
  const fromCi =
    process.env.WORKERS_CI_BUILD_UUID ?? process.env.WORKERS_CI_COMMIT_SHA;
  if (fromCi) {
    return fromCi;
  }
  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: {
    __WAYF_HOMEPAGE_CACHE_ID__: JSON.stringify(homepageCacheId()),
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
