import {
  isMarkdownDocumentPath,
  markdownBody,
  markdownResponse,
  wantsMarkdown,
} from "@/lib/markdown";
import homepageStylesheet from "@/tailwind.css?url";
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

// Browsers must revalidate HTML after a deploy so they cannot keep a
// document that points at deleted hashed /assets/* files.
const HOMEPAGE_BROWSER_CACHE_CONTROL = "public, max-age=0, must-revalidate";
// caches.default honors Cache-Control on put(). max-age=0 makes put() fail
// (413) or match() miss, so the stored copy uses a long TTL. Invalidation is
// the build-scoped cache key, not this header.
const HOMEPAGE_EDGE_CACHE_CONTROL = "public, max-age=86400";

function isHomepageGet(request: Request): boolean {
  if (request.method !== "GET") {
    return false;
  }
  const url = new URL(request.url);
  return url.pathname === "/" && url.search === "";
}

function homepageCacheKey(request: Request): Request {
  const url = new URL("/", request.url);
  url.searchParams.set(
    "v",
    `${__WAYF_HOMEPAGE_CACHE_ID__}:${homepageStylesheet}`,
  );
  return new Request(url.href, { method: "GET" });
}

function withCacheControl(response: Response, cacheControl: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", cacheControl);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function edgeCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

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

    if (!isHomepageGet(request)) {
      return withMeetRobots(
        request,
        await requestHandler(rewriteLegacyCreatePost(request), loadContext),
      );
    }

    const cache = edgeCache();
    const cacheKey = homepageCacheKey(request);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return withCacheControl(cached, HOMEPAGE_BROWSER_CACHE_CONTROL);
    }

    const response = await requestHandler(request, loadContext);
    if (response.status !== 200) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", HOMEPAGE_EDGE_CACHE_CONTROL);
    headers.append("Vary", "Accept, Accept-Encoding");
    const cacheable = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    ctx.waitUntil(cache.put(cacheKey, cacheable.clone()));
    return withCacheControl(cacheable, HOMEPAGE_BROWSER_CACHE_CONTROL);
  },
} satisfies ExportedHandler<Env>;
