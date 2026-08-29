import { IconGithub } from "@/components/icons";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction } from "react-router";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const themeScript = `(()=>{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        <div className="h-[1px] w-full shrink-0 bg-border" />
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
                <IconGithub className="h-[1.2rem] w-[1.2rem]" />
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
