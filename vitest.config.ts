import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/db\/client$/,
        replacement: path.join(root, "tests/support/database.ts"),
      },
      {
        find: /^@\//,
        replacement: `${path.join(root, "app")}/`,
      },
    ],
  },
  test: {
    environment: "node",
    setupFiles: ["tests/support/env.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    hookTimeout: 30_000,
  },
});
