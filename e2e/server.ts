import "./pin-clock.ts";
import { createServer as createHttpServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { createServer, isRunnableDevEnvironment } from "vite";
import { TEST_DATABASE_URL } from "../tests/support/database-url.ts";

process.env.TZ = "UTC";
process.env.DATABASE_URL = TEST_DATABASE_URL;
delete process.env.VITE_DATABASE_URL;

const port = Number(process.env.PORT ?? 4173);

type CloudflareContext =
  typeof import("../app/cloudflare-context.ts").cloudflareContext;

function testContext(contextKey: CloudflareContext) {
  const context = new RouterContextProvider();
  context.set(contextKey, {
    env: { DATABASE_URL: TEST_DATABASE_URL },
    ctx: {
      waitUntil() {},
      passThroughOnException() {},
    } as unknown as ExecutionContext,
  });
  return context;
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function toWebRequest(req: IncomingMessage) {
  const host = req.headers.host ?? `127.0.0.1:${port}`;
  const url = new URL(req.url ?? "/", `http://${host}`);
  const method = req.method ?? "GET";
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  if (method === "GET" || method === "HEAD") {
    return new Request(url, { method, headers });
  }
  return new Request(url, {
    method,
    headers,
    body: await readBody(req),
  });
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}

const vite = await createServer({
  configFile: path.resolve("vite.e2e.config.ts"),
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "warn",
});

const ssr = vite.environments.ssr;
if (!isRunnableDevEnvironment(ssr)) {
  throw new Error("SSR environment has no module runner");
}

const database = (await ssr.runner.import("@/db/client")) as {
  resetDatabase: () => Promise<void>;
};
await database.resetDatabase();

const { cloudflareContext } = (await ssr.runner.import(
  "@/cloudflare-context",
)) as { cloudflareContext: CloudflareContext };

const handle = createRequestHandler(
  () => ssr.runner.import("virtual:react-router/server-build"),
  "development",
);

const server = createHttpServer((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const response = await handle(
        await toWebRequest(req),
        testContext(cloudflareContext),
      );
      await send(res, response);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end(error instanceof Error ? error.stack : String(error));
      }
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`e2e server http://127.0.0.1:${port}`);
});
