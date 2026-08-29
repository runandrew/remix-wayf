import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { themeSessionResolver } from "@/sessions.server";
import { clsx } from "clsx";
import { Github } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { getTheme } = await themeSessionResolver(request);

  // Homepage HTML is cached at the edge. Keep it theme-neutral so one
  // cached copy works for everyone. PreventFlashOnWrongTheme applies
  // the cookie before first paint.
  return {
    theme: url.pathname === "/" ? null : getTheme(),
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <ThemedDocument>{children}</ThemedDocument>
    </ThemeProvider>
  );
}

function ThemedDocument({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-between px-4">
      <Outlet />
      <div className="flex w-full flex-col items-center justify-between gap-1 pt-8">
        <Separator />
        <div className="flex w-full flex-row items-center justify-between pb-4">
          <Link to="/">
            <span className="text-m scroll-m-20 font-semibold tracking-tight">
              WAYF
            </span>
          </Link>
          <div className="flex flex-row items-center">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/runandrew/remix-wayf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100" />
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </main>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? "Not found"
      : "Something went wrong"
    : "Something went wrong";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4">
      <p className="text-lg font-semibold">{message}</p>
      <Link to="/" className="mt-4 underline">
        Back to WAYF
      </Link>
    </main>
  );
}
