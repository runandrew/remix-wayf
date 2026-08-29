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

const HOMEPAGE_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function isHomepageGet(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }
  return new URL(request.url).pathname === "/";
}

// Bump when homepage HTML or the theme boot script changes.
const HOMEPAGE_CACHE_VERSION = "3";

function homepageCacheKey(request: Request): Request {
  const url = new URL("/", request.url);
  url.searchParams.set("v", HOMEPAGE_CACHE_VERSION);
  return new Request(url.href, { method: "GET" });
}

function edgeCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

function rewriteLegacyCreatePost(request: Request): Request {
  if (request.method !== "POST") {
    return request;
  }
  const url = new URL(request.url);
  if (url.pathname !== "/") {
    return request;
  }
  url.pathname = "/create";
  return new Request(url, request);
}

export default {
  async fetch(request, env, ctx) {
    const loadContext = { cloudflare: { env, ctx } };

    if (!isHomepageGet(request)) {
      return requestHandler(rewriteLegacyCreatePost(request), loadContext);
    }

    const cache = edgeCache();
    const cacheKey = homepageCacheKey(request);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await requestHandler(request, loadContext);
    if (response.status !== 200) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", HOMEPAGE_CACHE_CONTROL);
    const cacheable = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    ctx.waitUntil(cache.put(cacheKey, cacheable.clone()));
    return cacheable;
  },
} satisfies ExportedHandler<Env>;
