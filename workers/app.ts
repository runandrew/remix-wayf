import {
  isMarkdownDocumentPath,
  markdownBody,
  markdownResponse,
  wantsMarkdown,
} from "@/lib/markdown";
import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  // eslint-disable-next-line import/no-unresolved -- Vite virtual module
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

function withMeetRobots(request: Request, response: Response): Response {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/m/") && response.status !== 404) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function markdownDocumentResponse(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }
  const path = new URL(request.url).pathname;
  if (!isMarkdownDocumentPath(path) || !wantsMarkdown(request)) {
    return null;
  }
  const { status, body } = markdownBody(path);
  return markdownResponse(request, status, body);
}

function rewriteLegacyCreatePost(request: Request): Request {
  if (request.method !== "POST") {
    return request;
  }
  const url = new URL(request.url);
  if (url.pathname !== "/") {
    return request;
  }
  // RR index actions post to /?index. Leave those on the homepage route.
  if (url.searchParams.has("index")) {
    return request;
  }
  url.pathname = "/create";
  return new Request(url, request);
}

export default {
  async fetch(request, env, ctx) {
    const loadContext = { cloudflare: { env, ctx } };

    const markdown = markdownDocumentResponse(request);
    if (markdown) {
      return withMeetRobots(request, markdown);
    }

    return withMeetRobots(
      request,
      await requestHandler(rewriteLegacyCreatePost(request), loadContext),
    );
  },
} satisfies ExportedHandler<Env>;
