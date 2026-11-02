import { cloudflareContext } from "../../app/cloudflare-context";
import * as createRoute from "../../app/routes/create";
import * as homeRoute from "../../app/routes/home";
import * as availsRoute from "../../app/routes/m.$uuid.avails";
import * as meetRoute from "../../app/routes/m.$uuid";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RouterContextProvider,
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
  type StaticHandler,
} from "react-router";
import { TEST_DATABASE_URL } from "./database";

const routes = [
  {
    id: "home",
    path: "/",
    Component: homeRoute.default,
    action: homeRoute.action,
  },
  {
    id: "create",
    path: "/create",
    loader: createRoute.loader,
    action: createRoute.action,
  },
  {
    id: "meet",
    path: "/m/:uuid",
    Component: meetRoute.default,
    loader: meetRoute.loader,
    action: meetRoute.action,
  },
  {
    id: "avails",
    path: "/m/:uuid/avails",
    Component: availsRoute.default,
    loader: availsRoute.loader,
    action: availsRoute.action,
  },
];

const handler: StaticHandler = createStaticHandler(routes);

function loadContext() {
  const context = new RouterContextProvider();
  context.set(cloudflareContext, {
    env: { DATABASE_URL: TEST_DATABASE_URL },
    ctx: {
      waitUntil() {},
      passThroughOnException() {},
    } as unknown as ExecutionContext,
  });
  return context;
}

export type Handled = {
  status: number;
  headers: Headers;
  text: string;
};

export async function handle(request: Request): Promise<Handled> {
  try {
    const result = await handler.query(request, {
      requestContext: loadContext(),
    });
    if (result instanceof Response) {
      return {
        status: result.status,
        headers: result.headers,
        text: await result.text(),
      };
    }
    if (result.statusCode >= 400) {
      return {
        status: result.statusCode,
        headers: new Headers(),
        text: "",
      };
    }
    const router = createStaticRouter(handler.dataRoutes, result);
    const text = renderToStaticMarkup(
      <StaticRouterProvider router={router} context={result} hydrate={false} />,
    );
    return { status: result.statusCode, headers: new Headers(), text };
  } catch (error) {
    if (error instanceof Response) {
      return {
        status: error.status,
        headers: error.headers,
        text: await error.text(),
      };
    }
    throw error;
  }
}

export function appRequest(
  path: string,
  init?: RequestInit & { form?: Record<string, string> },
) {
  const headers = new Headers(init?.headers);
  let body = init?.body;
  if (init?.form) {
    headers.set("content-type", "application/x-www-form-urlencoded");
    body = new URLSearchParams(init.form);
  }
  return new Request(new URL(path, "http://wayf.test"), {
    ...init,
    headers,
    body,
  });
}
