import path from "node:path";
import { fileURLToPath } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    dedupe: ["react", "react-dom"],
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
  // Prebundling these packages crashes the meet page.
  optimizeDeps: {
    exclude: [
      "@radix-ui/react-toast",
      "@radix-ui/react-slot",
      "react-day-picker",
    ],
  },
  ssr: {
    noExternal: ["posthog-js", "@posthog/react"],
  },
});
